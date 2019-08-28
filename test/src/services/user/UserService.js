const Interface = require('./UserServiceInterface');
const { OTPInterface } = require('..');

class UserService {

    constructor(db, OTP) {
        this.db = db;
        this.OTP = OTP;
    }

    static dependencies() {
        return ['db', OTPInterface];
    }

    static interface() {
        return Interface;
    }

    initialize() {
        this.User = this.db.model('User');
    }

    async getUserByMobile(mobile) {
        let user = await this.User
            .findOne({
                where: {
                    username: mobile
                }
            });
        return user;
    }

    async create(mobile, password) {
        let user = await this.User.create({ username: mobile, password: password });
        return user;
    }

}

module.exports = UserService;
