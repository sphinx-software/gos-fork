/* eslint no-unused-vars: "off", class-methods-use-this: off */

class ServiceMapper {
    make(Service, Interface) {
        let _interface = new Interface();

        // copy method from adapter to interface
        for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(_interface))) {
            let method = _interface[name];
            // Supposedly you'd like to skip constructor
            if (!(method instanceof Function) || method === _interface) continue;
            if (Service[name] instanceof Function) {
                _interface[name] = Service[name];
            }
        }

        // copy attributes to interface
        for (let name of Object.keys(Service)) {
            _interface[name] = Service[name];
        }

        if (Service.initialize) {
            _interface.initialize = Service.initialize;
        }

        return _interface;
    }
}

module.exports = ServiceMapper;
