module.exports = {
    TestService: {
        title: 'Unit Test',
        suites: [
            require('./unittest/InjectTestSuite'),
            require('./unittest/OTPTestSuite'),
            require('./unittest/UserTestSuite')
        ]
    },
    TestApiRequest: {
        title: 'Testing the Api Request',
        suites: [
            require('./request/AuthTestSuite'),
            require('./request/BookTestSuite')
        ]
    }
}
