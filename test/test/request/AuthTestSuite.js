const { OTPInterface } = require('src/services');
const RequestBuilder = require('../../../index').RequestBuilder;
const auth = require('../auth');

class AuthTestSuite {

    constructor(config, OTP) {
        this.OTP = OTP;
        this.mobile = "123456789";

        const host = config.http.host + ':' + config.http.port;
        this.authRequest = new RequestBuilder({
            host: host,
            route: '/api/v1/auth'
        });

        this.authVerifyRequest = new RequestBuilder({
            host: host,
            route: '/api/v1/auth/verify'
        });
    }

    static dependencies() {
        return ['config', OTPInterface];
    }

    before() {
    }

    registerMobile() {
        return this.authRequest
            .setMethod('post')
            .setData({
                mobile: this.mobile
            })
            .setStatusCode(200)
            .exec(res => {
                this.otp = res.body.otp;
            })
    }

    verify() {
        return this.authVerifyRequest
            .setMethod('post')
            .setData({
                mobile: this.mobile,
                code: this.otp
            })
            .setStatusCode(200)
            .exec(res => {
                auth.token = res.body.token;
            })
    }
}

module.exports = AuthTestSuite;
