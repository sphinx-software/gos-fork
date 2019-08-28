const { OTPInterface } = require('src/services');
const RequestBuilder = require('../../../index').RequestBuilder;
const authObject = require('../auth');

class BookTestSuite {

    constructor(config, OTP) {
        this.OTP = OTP;
        this.mobile = "123456789";

        const host = config.http.host + ':' + config.http.port;
        this.bookRequest = new RequestBuilder({
            host: host,
            route: '/api/v1/book',
            authObject: authObject
        });
    }

    static dependencies() {
        return ['config', OTPInterface];
    }

    before() {
    }

    createBookMissingParams() {
        return this.bookRequest
            .setMethod('post')
            .enableAuth()
            .setStatusCode(400)
            .setResponse({
                message: 'ERROR_CODE_MISSING'
            })
            .exec();
    }

    createBook() {
        let data = {
            code: 'B1',
            name: 'Book 1',
            price: 1000,
            date: '2018-01-01T00:00:00.000Z'
        }
        return this.bookRequest
            .setMethod('post')
            .enableAuth()
            .setStatusCode(405)
            .setData(data)
            .setResponse(data)
            .exec();
    }
}

module.exports = BookTestSuite;
