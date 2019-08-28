
const ServiceMapper = require('./map-service');
const Mapper = new ServiceMapper();

function getDependencyName(d) {
    let depName;
    if (typeof d === 'function') {
        depName = d.name.replace('Interface', '');
    } else if (typeof d === 'string') {
        depName = d;
    }
    return depName;
}

class SingletonService {

    constructor(core) {
        this.core = core;
    }

    async buildAll(services) {
        const core = this.core;
        let providers = services.map(Provider => {
            let dependencies = Provider.dependencies();
            let Interface;
            if (Provider.interface) {
                Interface = Provider.interface();
            }
            let mapDependencies = [];
            if (dependencies && dependencies.length > 0) {
                dependencies = dependencies.map(d => getDependencyName(d));
                mapDependencies = dependencies.map(d => core.services[d]);
            }
            let Service = new Provider(...mapDependencies);

            // mapping interface if exists
            let serviceName = null;
            if (Interface) {
                let _interface = Mapper.make(Service, Interface);
                serviceName = Interface.name.replace('Interface', '');
                console.info(`GOS-FRAMEWORK -> service: ${serviceName}, dependencies=${dependencies}`);
                core.services[serviceName] = _interface;
            }
            return { dependencies, serviceName }
        });

        // map dependencies again for resolve cycle dependency
        for (let i = 0; i < providers.length; i++) {
            const provider = providers[i];
            let { dependencies, serviceName } = provider;

            if (serviceName) {
                dependencies.forEach(depName => {
                    if (depName && !core.services[serviceName][depName]) {
                        core.services[serviceName][depName] = core.services[depName];
                    }
                    return core.services[depName];
                });

                if (core.services[serviceName].initialize) {
                    await core.services[serviceName].initialize();
                }
            }
        }
    }

    async inject(Provider) {
        const core = this.core;
        let dependencies = Provider.dependencies();
        let Interface;
        if (Provider.interface) {
            Interface = Provider.interface();
        }
        let mapDependencies = [];
        if (dependencies && dependencies.length > 0) {
            dependencies = dependencies.map(d => getDependencyName(d));
            mapDependencies = dependencies.map(d => core.services[d]);
        }
        let Service = new Provider(...mapDependencies);

        // mapping interface if exists
        let serviceName = null;
        if (Interface) {
            let _interface = Mapper.make(Service, Interface);
            serviceName = Interface.name.replace('Interface', '');
            console.info(`GOS-FRAMEWORK -> service: ${serviceName}, dependencies=${dependencies}`);
            core.services[serviceName] = _interface;

            if (core.services[serviceName].initialize) {
                await core.services[serviceName].initialize();
            }
            return _interface;
        }
    }
}

module.exports = SingletonService;
module.exports.getDependencyName = getDependencyName;
