/* eslint no-unused-vars: "off", class-methods-use-this: off */

/**
 * The universal interface for OptSender Adapter
 *
 */
class OTPInterface {
    generateOTP() { }

    registerMobile(mobile) { }

    verify(mobile, code) { }
}

module.exports = OTPInterface;
