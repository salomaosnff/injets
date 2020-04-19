import { Constructor, ModuleOptions, DynamicModule } from "./types";
import { ProviderRef } from "./provider";
import { MODULE_OPTIONS } from "./meta/module.meta";
import { PROVIDER_DEPENDENCIES } from "./meta/provider.meta";
import { ProviderNotFoundError } from "./errors/module.errors";

export const MODULE_REF = Symbol("current_module");
export const ROOT_MODULE_REF = Symbol("root_module");
export class ModuleRef<T = any> {
  readonly providers = new Map<any, ProviderRef>();
  readonly exports = new Map<any, ProviderRef>();
  readonly importedProviders = new Map<any, ProviderRef>();
  readonly modules = new Map<Constructor, ModuleRef>();
  readonly globals = new Set<ModuleRef>()
  readonly root: ModuleRef

  constructor(public name: string, public instance: T, root?: ModuleRef, readonly isGlobal = false) {
    this.root = root || this;
  }

  private async getGlobal<T = any>(token: any): Promise<ProviderRef<T> | void> {
    for (const module of this.root.globals.values()) {
      if (module.providers.has(token)) {
        return module.providers.get(token)
      }
    }
  }

  async get<T>(token: Constructor<T> | any, required?: true): Promise<T>;
  async get<T>(
    token: Constructor<T> | any,
    required: false
  ): Promise<T | undefined>;
  async get<T>(
    token: Constructor<T> | any,
    required = true
  ): Promise<T | undefined> {
    const provider = this.providers.has(token)
      ? this.providers.get(token)
      : this.importedProviders.has(token)
        ? this.importedProviders.get(token)
        : await this.getGlobal(token)
      ;

    if (typeof provider !== 'undefined') return provider.get();
    if (required) {
      throw new ProviderNotFoundError(token, this.name);
    }
  }

  getModule<T = any>(module: Constructor<T>): ModuleRef<T> {
    const ref = this.modules.get(module);

    if (ref) return ref;

    throw new Error(`Module ${module.name} not found in ${this.name}!`);
  }

  static async create(
    module: DynamicModule,
    root?: ModuleRef
  ): Promise<ModuleRef>;
  static async create<T extends Constructor>(
    module: T,
    root?: ModuleRef
  ): Promise<ModuleRef<T>>;
  static async create<T extends Constructor>(
    module: DynamicModule | T,
    root?: ModuleRef
  ): Promise<ModuleRef<T>> {
    let options: ModuleOptions;
    let ModuleConstructor: Constructor;

    if (typeof module === "function") {
      options = Reflect.getMetadata(MODULE_OPTIONS, module);

      ModuleConstructor = module;
    } else {
      options = module;
      ModuleConstructor = module.module;
    }

    const imports = new Set(options.imports || []);
    const exportedProviders = new Set(options.exports || []);
    const providers = new Set(
      (options.providers || []).sort((a, b) => {
        const depsA: any[] =
          typeof a === "function"
            ? Reflect.getMetadata(PROVIDER_DEPENDENCIES, a) || []
            : [];

        const tokenB = typeof b === "function" ? b : b.provide;

        return depsA.includes(tokenB) ? -1 : 0;
      })
    );

    const ref = new ModuleRef(ModuleConstructor.name, new ModuleConstructor(), root, options.global);

    root = root || ref;

    // Init Submodules
    for (const submodule of imports) {
      const submoduleInstance = await this.create(submodule, ref);
      submoduleInstance.exports.forEach((provider, token) => {
        ref.importedProviders.set(token, provider);
      });
      ref.modules.set(submodule, submoduleInstance);
    }

    // Init Providers
    for (const provider of providers) {
      const token =
        typeof provider === "function" ? provider : provider.provide;
      ref.providers.set(token, new ProviderRef(provider, ref));
    }

    ref.providers.set(
      ROOT_MODULE_REF,
      new ProviderRef({ useValue: root }, ref)
    );

    // Exports
    for (const provider of exportedProviders) {
      if (!ref.providers.has(provider)) {
        throw new Error(`${provider} not exists!`);
      }

      ref.exports.set(provider, ref.providers.get(provider) as ProviderRef);
    }

    const moduleDeps =
      Reflect.getMetadata(PROVIDER_DEPENDENCIES, ModuleConstructor) || [];

    for (const dep of moduleDeps) {
      if (dep.key) {
        ref.instance[dep.key] = await ref.get(dep.token, dep.required);
      }
    }

    if (ref.isGlobal) {
      root.globals.add(ref)
    }

    if (ref.instance.onModuleInit) {
      ref.instance.onModuleInit();
    }

    return ref;
  }
}
