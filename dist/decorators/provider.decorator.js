import { PROVIDER_SCOPE } from '../meta/provider.meta';
export function Provider(scope = 'SINGLETON') {
    return function (target) {
        Reflect.defineMetadata(PROVIDER_SCOPE, scope, target);
    };
}
//# sourceMappingURL=provider.decorator.js.map