const fs = require('fs');
const restify = require('restify');
const os = require('os');
const TestUtil = require('./lib/test-util');
const Mocha = require('mocha');

class GosApiFramework {

    constructor(config, log) {
        this.config = config;
        this.log = log || console;
    }

    /**
     * Bootstrap the server with the config
     */
    async run() {
        const config = this.config;
        const http_options = {
            app: config.app.name,
            version: config.app.version
        };

        // config for ssl
        if (config.ssl) {
            http_options.key = fs.readFileSync(config.certs.key);
            http_options.certificate = fs.readFileSync(config.certs.certificate);
        }

        // create http server base on above options
        const app = restify.createServer(http_options);
        this.app = app;

        // catch the EADDRINUSE error
        app.on('error', function(err) {
            if (err.errno === 'EADDRINUSE') {
                this.log.error('Port already in use.');
                process.exit(1);
            } else {
                this.log.log(err);
            }
        });

        require('./restify')(app, config, this.log);

        const { version, core, singleton } = await require('./bootstrap')(app, config, this.log);

        app.use((request, response, next) => {
            request.gosCore = core;
            next();
        });

        return new Promise(resolve => {
            app.listen(config.http.port, () => {
                console.log(`App started on ${config.http.host}:${config.http.port} with ssl=${config.http.ssl}`);
                console.log('OS: ' + os.platform() + ', ' + os.release());
                this.core = core;
                resolve({
                    version,
                    app,
                    db: core.services.db,
                    singleton: singleton
                });
            });
        });
    }

    /**
     * Run Testing with test config file
     *
     * @param {*} testConfig File should return
     * {
     *  Test: {
     *      title: 'Testing',
     *      suites: [
     *          require('test suite file')
     *      ]
     *  }
     * }
     */
    async loadTestSuite(testConfig) {
        let core = this.core;
        if (!core) throw 'should call run before loadTestSuite';
        let testUtil = new TestUtil();

        let rootSuite = new Mocha.Suite(`${this.config.app.name} ${this.config.app.version} Testing`);
        let config = require(testConfig);
        let keys = Object.keys(config);
        for (let i in keys) {
            let key = keys[i];
            let testDesc = config[key];
            let title = testDesc.title || key;
            let suites = testDesc.suites;
            if (suites.length > 0) {
                let suite = new Mocha.Suite(title);
                for (let i = 0; i < suites.length; i++) {
                    let testClass = suites[i];
                    let s = await testUtil.runTestSuite(testClass, core);
                    if (s) {
                        suite.addSuite(s);
                    }
                }
                rootSuite.addSuite(suite);
            }
        }

        var runner = new Mocha.Runner(rootSuite);
        // eslint-disable-next-line no-unused-vars
        const reporter = new Mocha.reporters.Spec(runner);
        runner.run(function(failures) {
            process.exitCode = failures ? 1 : 0;
        });
    }
}

module.exports = GosApiFramework;
module.exports.ApiValidator = require('./lib/api-validator');
module.exports.ServiceMapper = require('./lib/map-service');
module.exports.User = require('./lib/strategies/user');
module.exports.JWT = require('./lib/strategies/jwt');
module.exports.RequestBuilder = require('./lib/request-builder');
