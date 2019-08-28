/* eslint prefer-spread: "off" */
const glob = require('./lib/glob');
const Sequelize = require('sequelize');
const path = require('path');
const RouterUtil = require('./lib/router-util');
const Router = new RouterUtil();
const SingletonService = require('./lib/singleton-service');
const jwt = require('./lib/strategies/jwt');

function initDatabase(config, log) {
    let { dialect, database, user, password, host, port, logging } = config.database;
    const sequelize = new Sequelize(database, user, password, {
        host: host,
        port: port,
        dialect: dialect,
        logging: logging
    });
    sequelize
        .authenticate()
        .then(() => {
            log.info('Connection has been established successfully.');
        })
        .catch(err => {
            log.error('Unable to connect to the database:', err);
        });

    return sequelize;
}

module.exports = async function(app, config, log) {

    // init database
    let core = {
        services: {
            log: log,
            config: config
        },
        controllers: {}
    };

    if (config.database) {
        core.services.db = initDatabase(config, log);

        // init authentication
        if (config.authenticate && config.authenticate.enable) {
            require('./lib/strategies/user').init(core.services.db);
            jwt.jwtStrategy(core.services.db, config.authenticate);
        }

        // init models
        if (config.model) {
            require(path.normalize(path.join(config.model, 'index.js'))).init(core.services.db);
        }
    }

    // init services
    const singleton = new SingletonService(core);
    if (config.services) {
        await singleton.buildAll(config.services);
    }
    core.services.singleton = singleton;

    // get all routers
    if (config.http && config.route) {
        glob.getGlobbedFiles(path.normalize(path.join(config.route, '**', '*.js'))).forEach(routePath => Router.initRoute(app, core, require(routePath)));
    }

    if (core.services.db) {
        // run db sync
        await core.services.db.sync();
    }

    return {
        version: require('./package.json').version,
        core,
        singleton: singleton
    };
}
