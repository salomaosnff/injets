import { PROVIDER_SCOPE, PROVIDER_DEPENDENCIES } from '../meta/provider.meta';
export function Provider(scope = 'SINGLETON') {
    return function (target) {
        Reflect.defineMetadata(PROVIDER_SCOPE, scope, target);
        const deps = Reflect.getMetadata(PROVIDER_DEPENDENCIES, target) || [];
        const paramsDeps = (Reflect.getMetadata('design:paramtypes', target) || []).map((token, index) => ({
            token,
            index,
            required: true
        }));
        Reflect.defineMetadata(PROVIDER_DEPENDENCIES, paramsDeps.concat(deps), target);
    };
}
//# sourceMappingURL=provider.decorator.js.map