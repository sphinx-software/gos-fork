const ApiValidator = require('../../../..').ApiValidator;
const { OTPInterface } = require('src/services');

class ParseBookId {

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
        req.Book = {
            id: params.book_id,
            userId: req.user.id
        }
    }
}

module.exports = ParseBookId;
