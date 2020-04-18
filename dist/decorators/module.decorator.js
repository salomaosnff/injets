import { MODULE_IMPORTS, MODULE_PROVIDER, MODULE_EXPORTS } from '../meta/module.meta';
import { Provider } from './provider.decorator';
export function Module(options) {
    return function (target) {
        options.providers = options.providers || [];
        options.providers.push(target);
        Reflect.defineMetadata(MODULE_IMPORTS, options.imports, target);
        Reflect.defineMetadata(MODULE_PROVIDER, options.providers, target);
        Reflect.defineMetadata(MODULE_EXPORTS, options.exports, target);
        return Provider()(target);
    };
}
//# sourceMappingURL=module.decorator.js.map