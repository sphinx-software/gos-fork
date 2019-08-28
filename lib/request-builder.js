const _ = require('lodash');
const util = require('util');

function defaultValue(builder) {
    builder._alreadyShowError = false;
    builder._logError = false;
    builder._logBody = false;
    builder.schemaContent = null;
    builder.method = null;
    builder.response = null;
    builder.statusCode = null;
    builder.enableAuthentication = false;
    builder.token = null;
    builder.data = null;
}

function error(msg, expected, actual) {
    var err = new Error(msg);
    err.expected = expected;
    err.actual = actual;
    err.showDiff = true;
    throw err;
}

// checks if module is available to load
function isModuleAvailable(moduleName) {
    try {
        return require.resolve(moduleName)
    } catch (e) {
        return false
    }
}

class RequestBuilder {
    constructor({ host, route, schema, timeout, authObject }) {
        if (!host) throw 'Missing host';
        if (!route) throw 'Missing route';
        if (!host.startsWith('http://')) {
            host = 'http://' + host;
        }
        this.host = host;
        this.route = route;
        this.schema = schema;
        this.timeout = timeout || 10000;
        this.authObject = authObject;
        defaultValue(this);

        this.chakram = require('chakram');
        this.expect = this.chakram.expect;

        this.chakram.addMethod('isResponseMatch', function(response, model, builder) {
            var notEqual = checkNotEqual(model, response.body, '');
            if (notEqual && builder._logError && !builder._alreadyShowError) {
                builder._alreadyShowError = true;
                console.info(util.inspect(response.body, false, null));
            }
            this.assert(!notEqual, notEqual.path + ': expected ' + notEqual.expect + '; actual ' + notEqual.actual);
        });
        this.chakram.addMethod('checkStatusCode', function(response, statusCode, builder) {
            var equal = response.response.statusCode === statusCode;
            if (!equal && builder._logError && !builder._alreadyShowError) {
                builder._alreadyShowError = true;
                console.info(util.inspect(response.body, false, null));
            }
            this.assert(equal, 'statusCode expected ' + statusCode + '; actual ' + response.response.statusCode + '; error: ' + (response.body ? response.body.message : ''));
        });

        this.request = function(builder, options) {
            var response = this.httpRequest({
                host: builder.host,
                route: builder.route,
                data: builder.data,
                method: builder.method,
                timeout: builder.timeout,
                options: options
            });

            // expect
            this.expect(response).to.have.checkStatusCode(builder.statusCode, builder);
            if (builder.schemaContent) {
                this.expect(response).to.have.schema(builder.schemaContent);
            }

            if (builder.response) {
                this.expect(response).to.have.isResponseMatch(builder.response, builder);
            }

            return this.chakram.wait();
        }

        this.httpRequest = function({ host, route, method, data, timeout, options }) {
            return this.chakram[method](host + route, data,
                _.merge({
                    strictSSL: false,
                    timeout: timeout
                }, options));
        }
    }

    setRoute(route) {
        this.route = route;
        return this;
    }

    setStatusCode(statusCode) {
        this.statusCode = statusCode;
        return this;
    }

    setMethod(method) {
        this.method = method;
        return this;
    }

    setData(data) {
        this.data = data;
        return this;
    }

    setResponse(response) {
        this.response = response;
        return this;
    }

    enableAuth() {
        this.enableAuthentication = true;
        return this;
    }

    setToken(customToken) {
        this.token = customToken;
        return this;
    }

    logError() {
        this._logError = true;
        return this;
    }

    logBody() {
        this._logBody = true;
        return this;
    }

    exec(callback) {
        if (!this.route)
            return error('route must not be null');
        if (!this.statusCode)
            return error('statusCode must not be null');
        if (!this.method)
            return error('method must not be null');
        if (this.method !== 'post' && this.method !== 'get')
            return error('method must be post or get');
        if (this.schema) {
            var schemaPath = './schema/' + this.schema + '/' + this.statusCode + '.json';
            if (!isModuleAvailable(schemaPath)) {
                schemaPath = './schema/common/' + this.statusCode + '.json';
                if (isModuleAvailable(schemaPath)) {
                    this.schemaContent = require(schemaPath);
                }
            } else {
                this.schemaContent = require(schemaPath);
            }
        }
        var _self = this;
        var options = {};
        if (this.enableAuthentication && (this.token || this.authObject)) {
            options.auth = {
                'bearer': this.token || this.authObject.token
            };
        }
        return this.request(this, options).then(function(res) {
            if (_self._logBody) console.info(res.body);
            // clear to default data
            defaultValue(_self);
            if (callback && typeof callback === 'function') return callback(res);
        });
    }
}

/**
 * Hàm kiểm tra dữ liệu model có khớp với dữ liệu api trả về
 *
 * @param  {[type]}  src  [description]
 * @param  {[type]}  desc [description]
 * @return {Boolean}      [description]
 */
function checkNotEqual(src, desc, path) {
    if (src && !desc) {
        return {
            path: path,
            expect: src,
            actual: desc
        };
    } else if (typeof src === 'object' && desc && typeof src === typeof desc) {
        if (Array.isArray(src)) {
            if (!Array.isArray(desc))
                return {
                    path: path,
                    expect: 'array',
                    actual: 'object'
                };
            if (src.length !== desc.length)
                return {
                    path: path,
                    expect: 'array length is ' + src.length,
                    actual: 'array length is ' + desc.length
                };

            for (let i = 0; i < src.length; i++) {
                let check = checkNotEqual(src[i], desc[i], path + (path === '' ? '' : '.') + '[' + i + ']');
                if (check) {
                    return check;
                }
            }
        } else {
            if (Array.isArray(desc))
                return {
                    path: path,
                    expect: 'object',
                    actual: 'array'
                };

            for (let key in src) {
                let check = checkNotEqual(src[key], desc[key], path + (path === '' ? '' : '.') + key);
                if (check) {
                    return check;
                }
            }
        }
    } else if (src !== desc) {
        return {
            path: path,
            expect: src,
            actual: desc
        };
    }
    return false;
}

module.exports = RequestBuilder;
