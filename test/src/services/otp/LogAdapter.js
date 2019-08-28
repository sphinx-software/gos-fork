const moment = require('moment');
const winston = require('winston');

class LogAdapter {
    constructor(options) {
        this.options = options;
        this.logger = winston.createLogger();
    }

    send({ mobile_number, message }) {
        this.logger.info({
            date: moment().toDate(),
            message: message,
            mobile_number: mobile_number
        });
    }
}

module.exports = LogAdapter;
