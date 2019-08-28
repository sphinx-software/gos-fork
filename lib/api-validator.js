const validator = require('validator');
const moment = require('moment');

function STRING(length, enums) {
    this._length = length;
    this._enums = enums;

    if (!(this instanceof STRING)) return new STRING(length, enums);
}

STRING.prototype.key = 'STRING';
STRING.prototype.validate = function(value) {
    if (typeof value !== 'string') {
        return 'INCORRECT';
    } else if (this._length && this._length > 0 && value.length > this._length) {
        return `MAX_LENGTH_${this._length}`;
    } else if (this._enums && this._enums.length > 0 && this._enums.indexOf(value) === -1) {
        return `VALUE_NOT_ALLOW`;
    }
};

function BOOLEAN() {
}

STRING.prototype.key = 'BOOLEAN';
BOOLEAN.prototype.validate = function(value) {
    return validator.isBoolean(value + '') ? null : 'INCORRECT';
};

function DATE() {
}

STRING.prototype.key = 'DATE';
DATE.prototype.validate = function(value) {
    return validator.isISO8601(value + '') ? null : 'INCORRECT';
};

function NUMBER(min, max) {
    this._min = min;
    this._max = max;
}

STRING.prototype.key = 'NUMBER';
NUMBER.prototype.validate = function(value) {
    if (!validator.isFloat(value + '')) {
        return 'INCORRECT';
    } else if (this._min && value < this._min) {
        return `MIN_${this._min}`
    } else if (this._max && value > this._max) {
        return `MAX_${this._max}`
    }
};

function ARRAY() {
}

STRING.prototype.key = 'ARRAY';
ARRAY.prototype.validate = function(value) {
    return Array.isArray(value) ? null : 'INCORRECT';
};

function OBJECT() {
}

STRING.prototype.key = 'OBJECT';
OBJECT.prototype.validate = function(value) {
    return typeof value === 'object' && !Array.isArray(value) ? null : 'INCORRECT';
};

function isNull(value) {
    return value === null || value === undefined;
}

/**
 * Validator for api params
 *
 * @param {object}      params of api request
 * @param {object}      paramDesc {param_name: type_of_param}, param_name include $ prefix will be required
 * @param {string}      prefix for error name, use in bunyan
 * @param {function}    callback callback of api
 * @returns ERROR CODE or Parse param
 */
function validatorParams({ params, paramDesc, prefix }) {
    let paramsValue = {};
    prefix = prefix || '';

    for (let attr in paramDesc) {
        let inValidMessage;
        let paramName = attr;
        let paramType = paramDesc[attr];

        // check param name with prefix $ for required
        if (paramName[0] === '$') {
            paramName = paramName.substr(1);
            if (!params || isNull(params[paramName]) || params[paramName].length === 0) {
                throw `ERROR_${prefix.toUpperCase()}${paramName.toUpperCase()}_MISSING`;
            }
        }

        // check param type
        if (params && !isNull(params[paramName]) && (typeof paramType === 'function' || (typeof paramType === 'object' && typeof paramType.validate === 'function'))) {
            if (typeof paramType === 'function') {
                paramType = new paramType();
            }
            if (typeof paramType.validate === 'function')
                inValidMessage = paramType.validate(params[paramName]);
            else
                throw `Param type ${paramName} is incorrect`;
        }

        if (inValidMessage) {
            throw `ERROR_${prefix.toUpperCase()}${paramName.toUpperCase()}_${inValidMessage}`;
        } else if (Array.isArray(paramType) && paramType.length > 0 && Array.isArray(params[paramName]) && params[paramName].length > 0) {
            // param type is OBJECT, check DATA TYPE of each attr in Object
            if (typeof paramType[0] === 'object' && typeof paramType[0].validate !== 'function') {
                for (let i = 0; i < params[paramName].length; i++) {
                    params[paramName][i] = validatorParams({
                        params: params[paramName][i],
                        paramDesc: paramType[0],
                        prefix: `${paramName}[${i}].`
                    });
                }

                // param type is DATA TYPE
            } else {
                if (typeof paramType[0] === 'function') {
                    paramType[0] = new paramType[0]();
                }
                if (typeof paramType[0].validate === 'function')
                    for (let i = 0; i < params[paramName].length; i++) {
                        inValidMessage = paramType[0].validate(params[paramName][i]);
                        if (inValidMessage) {
                            throw `ERROR_${prefix.toUpperCase()}${paramName.toUpperCase()}[${i}]_${inValidMessage}`;
                        }
                        parseValue(params[paramName], params[paramName], i, paramType[0]);
                    }
                else
                    throw `Param type ${paramName} is incorrect`;
            }
            parseValue(params, paramsValue, paramName, paramType);
        } else if (typeof paramType === 'object' && params && typeof params[attr] === 'object') {
            paramsValue[paramName] = validatorParams({
                params: params[paramName],
                paramDesc: paramType,
                prefix: `${paramName}.`
            });
        } else {
            parseValue(params, paramsValue, paramName, paramType);
        }
    }
    return paramsValue;
}

function parseValue(params, paramsValue, paramName, paramType) {
    const value = params[paramName];
    if (value) {
        if (typeof value === 'string' && !(paramType instanceof STRING)) {
            if (paramType instanceof NUMBER) {
                paramsValue[paramName] = parseFloat(value);
            } else if (paramType instanceof BOOLEAN) {
                paramsValue[paramName] = value.toLowerCase() === 'true' || value === '1';
            } else if (paramType instanceof DATE) {
                paramsValue[paramName] = moment(value);
            }
        } else {
            paramsValue[paramName] = params[paramName];
        }
    }
}

module.exports = {
    validate: validatorParams,
    STRING: STRING,
    NUMBER: NUMBER,
    BOOLEAN: BOOLEAN,
    DATE: DATE,
    ARRAY: ARRAY,
    OBJECT: OBJECT
}
