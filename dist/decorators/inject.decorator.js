import { PROVIDER_DEPENDENCIES } from "../meta/provider.meta";
export function Inject(token, options = { required: true }) {
    return function (target, key, index) {
        const deps = Reflect.getMetadata(PROVIDER_DEPENDENCIES, target.constructor) || [];
        token =
            token !== undefined
                ? token
                : typeof index === 'number'
                    ? Reflect.getMetadata("design:paramtypes", target, key)[index]
                    : Reflect.getMetadata("design:type", target, key);
        Reflect.defineMetadata(PROVIDER_DEPENDENCIES, deps.concat({
            key,
            index,
            token,
            required: options.required,
        }), typeof target === "function" ? target : target.constructor);
    };
}
export function InjectOptional(token) {
    return Inject(token, { required: false });
}
//# sourceMappingURL=inject.decorator.js.map