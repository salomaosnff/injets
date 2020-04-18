import { PROVIDER_DEPENDENCIES } from '../meta/provider.meta';
export function Inject() {
    return function (target, key) {
        const deps = Reflect.getMetadata(PROVIDER_DEPENDENCIES, target.constructor) || [];
        Reflect.defineMetadata(PROVIDER_DEPENDENCIES, deps.concat({
            key,
            type: Reflect.getMetadata('design:type', target, key)
        }), target.constructor);
    };
}
//# sourceMappingURL=inject.decorator.js.map