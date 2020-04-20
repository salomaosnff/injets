import { ProviderOptions, Constructor } from "./types";
import { ModuleRef } from "./module";
import { PROVIDER_SCOPE, PROVIDER_DEPENDENCIES } from "./meta/provider.meta";

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
      };
    } else {
      this.options = Object.assign(
        { scope: "SINGLETON" },
        optionsOrConstructor
      );
    }
  }

  static async create<T extends any>(
    optionsOrConstructor: ProviderOptions | Constructor,
    moduleRef: ModuleRef
  ): Promise<T> {
    let ProviderConstructor: Constructor | undefined;

    if (typeof optionsOrConstructor === "function") {
      ProviderConstructor = optionsOrConstructor;
    } else if (typeof optionsOrConstructor.useClass === "function") {
      ProviderConstructor = optionsOrConstructor.useClass;
    } else if (typeof optionsOrConstructor.useFactory === "function") {
      return optionsOrConstructor.useFactory();
    }

    if (ProviderConstructor) {
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
          deps.params[item.index] = await moduleRef.get(
            item.token,
            item.required
          );
        } else if (item.key !== undefined) {
          deps.props[item.key] = await moduleRef.get(item.token, item.required);
        }
      }

      const instance = new ProviderConstructor(...deps.params);

      return instance;
    }

    return (optionsOrConstructor as ProviderOptions).useValue;
  }

  factory(): Promise<T> {
    if (typeof this.options.useFactory === "function") {
      return this.options.useFactory();
    }

    if (typeof this.options.useClass === "function") {
      return ProviderRef.create(this.options, this.module);
    }

    return this.options.useValue;
  }

  async get(): Promise<T> {
    if (this.options.scope === "SINGLETON") {
      if (this.instance) return this.instance;
      return (this.instance = await this.factory());
    }

    return this.factory();
  }
}
