const path = require('path');

module.exports = {
    app: {
        name: 'gos-framework',
        version: '1.0.0'
    },

    route: path.normalize(`${__dirname}/../src/routes`),
    model: path.normalize(`${__dirname}/../src/models`),

    // inject services
    services: [
        require('src/services/otp/OTP'),
        require('src/services/user/UserService')
    ],

    // config for services
    http: require('./http'),
    log: require('./log'),
    database: require('./database'),
    authenticate: require('./authenticate'),
    otp: require('./otp')

}
