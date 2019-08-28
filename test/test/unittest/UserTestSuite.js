const { UserServiceInterface } = require('src/services');
const assert = require('chai');

class UserTestSuite {
    constructor(UserService) {
        this.UserService = UserService;
    }

    static dependencies() {
        return [UserServiceInterface];
    }

    before() {
    }

    async getUserByMobile() {
        let r = await this.UserService.getUserByMobile("123456789");
        assert.assert(r);
    }
}

module.exports = UserTestSuite;
