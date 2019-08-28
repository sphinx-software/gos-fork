const Interface = require('./OTPInterface');
const OTPGenerator = require('./OTPGenerator');
const { UserServiceInterface } = require('..');
const bcryptjs = require('bcryptjs');
class OTP {

    constructor(config, UserService) {
        this.config = config;
        this.UserService = UserService;
    }

    static dependencies() {
        return ['config', UserServiceInterface];
    }

    static interface() {
        return Interface;
    }

    initialize() {
        this.generator = new OTPGenerator();
        if (this.config.otp) {
            let serviceConfig = this.config.otp;

            const Adapter = serviceConfig.adapter;
            if (!Adapter) throw 'No adapter config';

            let adapter = new Adapter(serviceConfig.options, this.core);

            this.adapter = adapter;
        } else {
            this.adapter = null;
        }
    }

    generateOTP() {
        return this.generator.generate(6, 'numbers');
    }

    async registerMobile(mobile) {
        if (this.adapter === null) {
            throw 'OTP adapter is not config';
        }
        let user = await this.UserService.getUserByMobile(mobile);
        const otp = this.generateOTP();
        if (user) {
            user.changePassword(otp);
        } else {
            user = await this.UserService.create(mobile, otp);
            user.changePassword(otp);
        }
        await user.save();
        this.adapter.send({ mobile_number: user.mobile, message: otp });
        return otp;
    }

    async verify(mobile, code) {
        let user = await this.UserService.getUserByMobile(mobile);
        return user && user.comparePassword(code) ? user : null;
    }
}

module.exports = OTP;
