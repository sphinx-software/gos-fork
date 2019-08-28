const { OTPInterface } = require('src/services');
const assert = require('chai');

class OTPTestSuite {
    constructor(OTP) {
        this.OTP = OTP;
        this.mobile = "123456789";
    }

    static dependencies() {
        return [OTPInterface];
    }

    before() {
    }

    async registerMobile() {
        let otp = await this.OTP.registerMobile(this.mobile);
        this.otp = otp;
        assert.assert(otp);
    }

    async verify() {
        let r = await this.OTP.verify(this.mobile, this.otp);
        assert.assert(r.username === this.mobile);
    }
}

module.exports = OTPTestSuite;
