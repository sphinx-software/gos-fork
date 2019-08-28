const restify = require('restify');
const path = require('path');
const helmet = require('helmet');
const moment = require('moment');
const passport = require('passport');
const corsMiddleware = require('restify-cors-middleware')

module.exports = (app, config, log) => {

    // fix for moment inValid date
    moment.createFromInputFallback = config => {
        // unreliable string magic, or
        config._d = new Date(config._i);
    };

    app.pre(restify.pre.sanitizePath());
    app.pre(restify.pre.userAgentConnection());

    if (config.http.cors) {
        const cors = corsMiddleware(config.http.cors);
        app.pre(cors.preflight)
        app.use(cors.actual)
    }

    app.use(restify.plugins.authorizationParser());
    app.use(restify.plugins.queryParser({ mapParams: true }));
    app.use(restify.plugins.bodyParser({
        mapParams: true,
        mapFiles: true,
        uploadDir: config.http.uploadDir || '/tmp'
    }));
    app.use(restify.plugins.gzipResponse());

    if (config.authenticate && config.authenticate.enable) {
        // use passport session
        app.use(passport.initialize());
        app.use(passport.session());
    }

    // Use helmet to secure Express headers
    app.use(helmet());

    // handle uncaught exception, return status code 500
    app.on('uncaughtException', (req, res, route, err) => {
        uncaughtException(err, res, req.params);
    })
    process.on('uncaughtException', err => {
        uncaughtException(err);
        process.exit(1);
    })

    function uncaughtException(err, res, params) {
        // log it
        var errorCode = Date.now();
        log.error({
            code: errorCode,
            stack: err.stack,
            message: err.message,
            params: params || ''
        });
        // respond with 500 'Internal Server Error'.
        if (res && !res._headerSent) {
            res.send(500, {
                code: errorCode,
                message: 'ERROR_SERVER'
            });
        }
    }
}
