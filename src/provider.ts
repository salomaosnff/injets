import { ProviderOptions, Constructor } from "./types";
import { ModuleRef } from "./module";
import {
  PROVIDER_SCOPE,
  PROVIDER_DEPENDENCIES,
  PROVIDER_GROUPS,
} from "./meta/provider.meta";
import { ProviderNotImportedError } from "./errors/provider.errors";

export class ProviderRef<T = any> {
  private instance!: T;
  private options: ProviderOptions = {};

  constructor(
    optionsOrConstructor: ProviderOptions | Constructor,
    private module: ModuleRef
  ) {
    if (typeof optionsOrConstructor === "function") {
      this.options = {
        useClass: optionsOrConstructor,
        provide: optionsOrConstructor,
        scope:
          Reflect.getMetadata(PROVIDER_SCOPE, optionsOrConstructor) ||
          "SINGLETON",
        groups:
          Reflect.getMetadata(PROVIDER_GROUPS, optionsOrConstructor) || [],
      };
    } else {
      this.options = Object.assign(
        { scope: "SINGLETON", groups: [] },
        optionsOrConstructor
      );
    }
  }

  static getName(token: any) {
    if (typeof token === "function") {
      return token.name;
    }
    return String(token);
  }

  static checkIfHasAllConstructorParams(
    ProviderConstructor: Constructor,
    moduleRef: ModuleRef
  ) {
    const paramsNames = [];

    const providerDependencyList =
      Reflect.getMetadata(PROVIDER_DEPENDENCIES, ProviderConstructor) || [];
    const currentProviderName = this.getName(ProviderConstructor);

    for (const provider of providerDependencyList) {
      if (moduleRef.hasProvider(provider.token)) {
        paramsNames.push(this.getName(provider));
      } else if (provider.required) {
        paramsNames.push("?");
        throw new ProviderNotImportedError(
          currentProviderName,
          paramsNames,
          provider
        );
      } else {
        paramsNames.push("undefined");
      }
    }
  }

  static create<T extends any>(
    optionsOrConstructor: ProviderOptions | Constructor,
    moduleRef: ModuleRef
  ): T {
    let ProviderConstructor: Constructor | undefined;

    if (typeof optionsOrConstructor === "function") {
      ProviderConstructor = optionsOrConstructor;
    } else if (typeof optionsOrConstructor.useClass === "function") {
      ProviderConstructor = optionsOrConstructor.useClass;
    } else if (typeof optionsOrConstructor.useFactory === "function") {
      return optionsOrConstructor.useFactory();
    }

    if (ProviderConstructor) {
      this.checkIfHasAllConstructorParams(ProviderConstructor, moduleRef);
      const depsList: {
        index?: number;
        key?: string | symbol;
        token: any;
        required: boolean;
      }[] =
        Reflect.getMetadata(PROVIDER_DEPENDENCIES, ProviderConstructor) || [];
      const deps: any = {
        params: [],
        props: {},
      };

      for (const item of depsList) {
        if (typeof item.index === "number") {
          deps.params[item.index] = moduleRef.get(item.token, item.required);
        } else if (item.key !== undefined) {
          deps.props[item.key] = moduleRef.get(item.token, item.required);
        }
      }

      const instance = new ProviderConstructor(...deps.params);

      return instance;
    }

    return (optionsOrConstructor as ProviderOptions).useValue;
  }

  factory(): T {
    if (typeof this.options.useFactory === "function") {
      return this.options.useFactory();
    }

    if (typeof this.options.useClass === "function") {
      return ProviderRef.create(this.options, this.module);
    }

    return this.options.useValue;
  }

  get(): T {
    if (this.options.scope === "SINGLETON") {
      if (this.instance) return this.instance;
      return (this.instance = this.factory());
    }

    return this.factory();
  }
}
