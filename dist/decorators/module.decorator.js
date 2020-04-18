import { MODULE_IMPORTS, MODULE_PROVIDER, MODULE_EXPORTS } from '../meta/module.meta';
export function Module(options) {
    return function (target) {
        Reflect.defineMetadata(MODULE_IMPORTS, options.imports, target);
        Reflect.defineMetadata(MODULE_PROVIDER, options.providers, target);
        Reflect.defineMetadata(MODULE_EXPORTS, options.exports, target);
    };
}
//# sourceMappingURL=module.decorator.js.map