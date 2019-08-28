const ApiValidator = require('../../../..').ApiValidator;
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');

class AuthLevel2 {

    constructor(config, OTP) {
        this.config = config;
        this.OTP = OTP;
    }

    static dependencies() {
        return ['config', 'OTP'];
    }

    static paramDesc() {
        return {
            '$mobile': ApiValidator.STRING(11),
            '$code': ApiValidator.STRING
        };
    }

    async exec(params) {
        let user = await this.OTP.verify(params.mobile, params.code);

        if (!user) throw 'Wrong mobile or code';

        const payload = {
            id: user.id,
            username: user.username
        };

        const token = jwt.sign(payload, this.config.authenticate.jwtSecret, { expiresIn: this.config.authenticate.jwtDuration });

        await user.update({ refresh_token: uuidv1() });

        return {
            token: token,
            refresh_token: user.refresh_token
        };
    }
}

module.exports = AuthLevel2;
