const jwt = require('./strategies/jwt');
const ApiValidator = require('..').ApiValidator;
const SingletonService = require('./singleton-service');

class RouterUtil {

    constructor() {
        function callController(controllerName, core, isParam, req, res, next) {
            Promise.resolve(async function(req, res) {
                let ApiClass = core.controllers[controllerName];
                if (ApiClass) {
                    let param = ApiValidator.validate({
                        params: req.params,
                        paramDesc: ApiClass.paramDesc
                    })
                    let data = await ApiClass.controller.exec(param, req, res);
                    if (!res._sent) {
                        if (isParam && next) {
                            return next();
                        } else if (data) {
                            res.send(200, data);
                        } else {
                            res.send(200);
                        }
                    }
                } else {
                    res.send(404);
                }
            }(req, res)).catch(function(error) {
                if (typeof error === 'object') {
                    console.error(error);
                    core.services.log.error(error);
                }
                return res.send(400, {
                    message: error.toString()
                });
            });
        }

        this.asyncMiddleware = function(controllerName, core, customAuth, isParam, isAuth) {
            return (req, res, next) => {
                if (isAuth && !customAuth) {
                    jwt.checkAuthenticate(req, res, () => {
                        callController(controllerName, core, isParam, req, res, next);
                    })
                } else if (isAuth && customAuth && typeof customAuth === 'function') {
                    customAuth(req, res, () => {
                        callController(controllerName, core, isParam, req, res, next);
                    })
                } else {
                    callController(controllerName, core, isParam, req, res, next);
                }
            };
        }

        this.initController = function(ApiClass, core) {
            if (ApiClass instanceof Function && ApiClass.dependencies) {
                let dependencies = ApiClass.dependencies();
                if (dependencies && dependencies.length > 0) {
                    dependencies = dependencies.map(d => {
                        let depName = SingletonService.getDependencyName(d);
                        return core.services[depName];
                    });
                } else {
                    dependencies = [];
                }
                let paramDesc = ApiClass.paramDesc();

                let _controller = new ApiClass(...dependencies);
                let controllerName = _controller.constructor.name;
                core.controllers[controllerName] = {
                    name: controllerName,
                    controller: _controller,
                    paramDesc: paramDesc
                };
                return controllerName;
            }
        }
    }

    initRoute(app, core, items) {
        items.forEach(item => {
            let HttpMethod = app[item.method];
            let config = core.services.config;
            let pathParams = item.pathParams;
            let middlewares = item.middlewares;
            let customAuth = item.customAuth;

            let controller = this.initController(item.controller, core);
            let opts = [item.route];
            if (middlewares && middlewares.length > 0) {
                opts = opts.concat(middlewares);
            }
            if (!item.auth) {
                opts.push(this.asyncMiddleware(controller, core, customAuth, false, false));
            } else if (config.authenticate && config.authenticate.enable) {
                opts.push(this.asyncMiddleware(controller, core, customAuth, false, true));
            }
            HttpMethod.call(app, ...opts);

            if (typeof pathParams === 'object') {
                for (let key in pathParams) {
                    let paramController = this.initController(pathParams[key], core);
                    if (!item.auth) {
                        app.param(key, this.asyncMiddleware(paramController, core, customAuth, true, false))
                    } else if (config.authenticate && config.authenticate.enable) {
                        app.param(key, this.asyncMiddleware(paramController, core, customAuth, true, true))
                    }
                }
            }
        });
    }
}

module.exports = RouterUtil;
