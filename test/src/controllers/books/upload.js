const { OTPInterface } = require('src/services');

class UploadBook {

    constructor(OTP) {
        this.OTP = OTP;
    }

    static dependencies() {
        return [OTPInterface];
    }

    static paramDesc() {
        return {};
    }

    exec(params, req, res) {
    }
}

module.exports = UploadBook;
