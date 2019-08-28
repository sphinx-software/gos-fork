const ApiValidator = require('../../../..').ApiValidator;
const { OTPInterface } = require('src/services');

class CreateBook {

    constructor(OTP) {
        this.OTP = OTP;
    }

    static dependencies() {
        return [OTPInterface];
    }

    static paramDesc() {
        return {
            '$code': ApiValidator.STRING(2),
            '$name': ApiValidator.STRING,
            '$price': ApiValidator.NUMBER,
            '$date': ApiValidator.DATE,
            'sold': ApiValidator.BOOLEAN,
            'year': ApiValidator.NUMBER,
            'description': ApiValidator.STRING,
            'authors': [{
                'name': ApiValidator.STRING,
                'country': ApiValidator.STRING(2, ["vn", "en"])
            }],
            tags: [ApiValidator.NUMBER],
            dates: [ApiValidator.DATE],
            'extra': {
                'name': ApiValidator.STRING,
                'value': ApiValidator.NUMBER
            },
            'extras': [{
                'name': ApiValidator.STRING,
                'value': ApiValidator.NUMBER
            }]
        };
    }

    exec(params, req, res) {
        res.send(405, params);
    }
}

module.exports = CreateBook;
