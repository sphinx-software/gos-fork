/* eslint no-unused-vars: "off", class-methods-use-this: off */

/**
 * The universal interface for User Service
 *
 */
class UserServiceInterface {
    getUserByMobile(mobile) { }

    create(mobile, password) { }
}

module.exports = UserServiceInterface;
