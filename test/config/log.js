const path = require('path');

module.exports = {
    name: 'Carpon',
    streams: [{
        type: 'rotating-file',
        path: path.normalize(`${__dirname}/../logs/error.log`),
        period: '1d',
        count: 7,
        level: 'error'
    }, {
        stream: process.stdout,
        level: 'info'
    }, {
        stream: process.stderr,
        level: 'error'
    }],

    level: process.env.LOG_LEVEL || 'debug'
};
