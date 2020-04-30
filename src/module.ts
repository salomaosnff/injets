import { Constructor, ModuleOptions, DynamicModule } from "./types";
import { ProviderRef } from "./provider";
import { MODULE_OPTIONS } from "./meta/module.meta";
import { PROVIDER_DEPENDENCIES } from "./meta/provider.meta";
import { ProviderNotFoundError } from "./errors/module.errors";

export const CURRENT_MODULE = Symbol("CURRENT_MODULE");
export const ROOT_MODULE = Symbol("ROOT_MODULE");

export class ModuleRef<T = any> {
  readonly providers = new Map<any, ProviderRef>();
  readonly exports = new Set<any>();
  readonly importedProviders = new Map<any, ProviderRef>();
  readonly modules = new Map<Constructor, ModuleRef>();
  readonly globalProviders = new Map<any, ProviderRef>();
  readonly root: ModuleRef;

  constructor(
    public name: string,
    public instance: T,
    root?: ModuleRef,
    readonly isGlobal = false
  ) {
    this.root = root || this;
  }

  async get<T>(token: any, required = true): Promise<T | undefined> {
    if (this.hasProvider(token)) {
      return this.getProvider(token)?.get();
    }

    if (required) {
      throw new ProviderNotFoundError(token, this.name);
    }
  }

  getProvider(token: any) {
    const { providers, importedProviders, root } = this;

    if (providers.has(token)) {
      return providers.get(token);
    }

    if (importedProviders.has(token)) {
      return importedProviders.get(token);
    }

    return root.globalProviders.get(token);
  }

  hasProvider(token: any) {
    return (
      this.providers.has(token) ||
      this.importedProviders.has(token) ||
      this.root.globalProviders.has(token)
    );
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

    const ref = new ModuleRef(
      ModuleConstructor.name,
      new ModuleConstructor(),
      root,
      options.global
    );

    options.exports?.forEach((exported) => {
      ref.exports.add(exported);
    });

    root = root || ref;

    // Current module as provider
    ref.providers.set(
      CURRENT_MODULE,
      new ProviderRef({ useValue: ref, provide: CURRENT_MODULE }, ref)
    );

    // Root module as provider
    ref.providers.set(
      ROOT_MODULE,
      new ProviderRef({ useValue: root, provide: CURRENT_MODULE }, ref)
    );

    // Init Submodules
    for (const submodule of imports) {
      const submoduleInstance = await this.create(submodule, root);
      submoduleInstance.exports.forEach((token) => {
        const provider = submoduleInstance.getProvider(token) as ProviderRef;
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

    // Globals
    if (ref.isGlobal) {
      for (const token of ref.exports) {
        ref.root.globalProviders.set(
          token,
          ref.providers.get(token) as ProviderRef
        );
      }
    }

    const moduleDeps =
      Reflect.getMetadata(PROVIDER_DEPENDENCIES, ModuleConstructor) || [];

    ProviderRef.checkIfHasAllConstructorParams(ModuleConstructor, ref);
    for (const dep of moduleDeps) {
      if (dep.key) {
        ref.instance[dep.key] = await ref.get(dep.token, dep.required);
      }
    }

    // On Module Init
    if (ref.instance.onModuleInit) {
      ref.instance.onModuleInit();
    }

    return ref;
  }
}
