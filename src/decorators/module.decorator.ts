import { MODULE_OPTIONS } from "../meta/module.meta";
import { ModuleOptions } from "../types";
import { Provider } from "./provider.decorator";

export interface OnModuleInit {
  onModuleInit(): any;
}

export function Module(options: ModuleOptions): ClassDecorator {
  return function (target) {
    options.providers = options.providers || [];

    options.providers.push(target as any);

    Reflect.defineMetadata(MODULE_OPTIONS, options, target);
  };
}
