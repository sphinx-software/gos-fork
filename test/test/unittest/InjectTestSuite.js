const assert = require('chai');

class TestService {
    constructor(db) {
        this.db = db;
    }
    static dependencies() {
        return ['db'];
    }

    static interface() {
        return TestServiceInterface;
    }

    initialize() {
        this.testObject = 1;
        return Promise.resolve(1);
    }

    testFunction() { }
}

class TestServiceInterface {
    testFunction() { }
}

class ServiceInjectionTestSuite {
    constructor(singleton) {
        this.singleton = singleton;
    }

    static dependencies() {
        return ['singleton'];
    }

    before() {
    }

    async injectCustomService() {
        let service = await this.singleton.inject(TestService);
        assert.assert(service instanceof TestServiceInterface);
        assert.assert(service.testObject === 1);
    }
}

module.exports = ServiceInjectionTestSuite;
