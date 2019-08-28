const ApiValidator = require('../../../..').ApiValidator;
const { OTPInterface } = require('src/services');

class AuthLevel1 {

    constructor(OTP) {
        this.OTP = OTP;
    }

    static dependencies() {
        return [OTPInterface];
    }

    static paramDesc() {
        return {
            '$mobile': ApiValidator.STRING(11)
        };
    }

    async exec(params) {
        let otp = await this.OTP.registerMobile(params.mobile);
        return { otp };
    }
}

module.exports = AuthLevel1;
