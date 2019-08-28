const SingletonService = require('./singleton-service');
const Mocha = require('mocha');
const testCase = require('mocha').describe;

class TestUtil {

    runTestSuite(TestClass, core) {
        return new Promise(resolve => {
            if (TestClass instanceof Function && TestClass.dependencies) {
                let dependencies = TestClass.dependencies();
                if (dependencies && dependencies.length > 0) {
                    dependencies = dependencies.map(d => {
                        let depName = SingletonService.getDependencyName(d);
                        return core.services[depName];
                    });
                } else {
                    dependencies = [];
                }

                let testClass = new TestClass(...dependencies);

                let controllerName = testClass.constructor.name;
                var suite = new Mocha.Suite(controllerName, testClass);

                if (testClass.beforeEach && testClass.beforeEach instanceof Function) {
                    suite.beforeEach(testClass.beforeEach)
                }

                if (testClass.beforeAll && testClass.beforeAll instanceof Function) {
                    suite.beforeAll(testClass.beforeAll)
                }

                if (testClass.afterEach && testClass.afterEach instanceof Function) {
                    suite.afterEach(testClass.afterEach)
                }

                if (testClass.afterAll && testClass.afterAll instanceof Function) {
                    suite.afterAll(testClass.afterAll)
                }

                testCase(controllerName, () => {
                    for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(testClass))) {
                        let method = testClass[name];
                        // Supposedly you'd like to skip constructor
                        if (!(method instanceof Function) || name === 'constructor' || name === 'before') continue;
                        suite.addTest(new Mocha.Test(name, method));
                    }
                });

                resolve(suite);
            } else {
                resolve();
            }
        });
    }
}

module.exports = TestUtil;
