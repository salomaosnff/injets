import { PROVIDER_DEPENDENCIES } from "../meta/provider.meta";

interface InjectOptions {
  required?:boolean
}
export function Inject(token?: any, options: InjectOptions = { required: true }): ParameterDecorator & PropertyDecorator {
  return function (target: Object, key: string | symbol, index?: number) {
    const deps =
      Reflect.getMetadata(PROVIDER_DEPENDENCIES, target.constructor) || [];

    token =
      token !== undefined
        ? token
        : index
        ? Reflect.getMetadata("design:paramtypes", target, key)[index]
        : Reflect.getMetadata("design:type", target, key);

    Reflect.defineMetadata(
      PROVIDER_DEPENDENCIES,
      deps.concat({
        key,
        index,
        token,
        required: options.required
      }),
      typeof target === 'function' ? target : target.constructor
    );
  };
}
