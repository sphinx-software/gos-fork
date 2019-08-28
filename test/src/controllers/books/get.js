const ApiValidator = require('../../../..').ApiValidator;
const { OTPInterface } = require('src/services');

class GetBook {

    constructor(OTP) {
        this.OTP = OTP;
    }

    static dependencies() {
        return [OTPInterface];
    }

    static paramDesc() {
        return {
            '$book_id': ApiValidator.NUMBER
        };
    }

    exec(params, req) {
        return req.Book;
    }
}

module.exports = GetBook;
