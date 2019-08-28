
require('app-module-path').addPath(__dirname);
const GosApiFramework = require('..');
const config = require('./config');
let server = new GosApiFramework(config);

server.run().then(() => {
    console.info('Test init finish');
    server.loadTestSuite('test/index');
});
