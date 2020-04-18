import { MODULE_OPTIONS } from "../meta/module.meta";
import { Provider } from "./provider.decorator";
export function Module(options) {
    return function (target) {
        options.providers = options.providers || [];
        options.providers.push(target);
        Reflect.defineMetadata(MODULE_OPTIONS, options, target);
        return Provider()(target);
    };
}
//# sourceMappingURL=module.decorator.js.map