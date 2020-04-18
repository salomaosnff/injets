import { Constructor, ModuleOptions, DynamicModule } from './types'
import { ProviderRef } from './provider'
import {
  MODULE_IMPORTS,
  MODULE_EXPORTS,
  MODULE_PROVIDER
} from './meta/module.meta'
import { PROVIDER_DEPENDENCIES } from './meta/provider.meta'

export const MODULE_REF = Symbol('current_module')
export const ROOT_MODULE_REF = Symbol('root_module')

export class ModuleRef<T = any> {
  readonly providers = new Map<any, ProviderRef>()
  readonly exports = new Map<any, ProviderRef>()
  readonly importedProviders = new Map<any, ProviderRef>()
  readonly modules = new Map<Constructor, ModuleRef>()

  constructor(public name: string, public instance: T) {}

  async get<T>(provider: Constructor<T>): Promise<T>
  async get<T = any>(token: any): Promise<T>
  async get<T>(token: Constructor<T> | any): Promise<T> {
    const provider = (this.providers.get(token) ||
      this.importedProviders.get(token)) as ProviderRef<T>

    if (!provider) {
      throw new Error(
        `Provider ${provider} not found in ${this.name} module context!`
      )
    }

    return provider.get()
  }

  getModule<T = any>(module: Constructor<T>): ModuleRef<T> {
    const ref = this.modules.get(module)

    if (ref) return ref

    throw new Error(`Module ${module.name} not found in ${this.name}!`)
  }

  static async create(
    module: DynamicModule,
    root?: ModuleRef
  ): Promise<ModuleRef>
  static async create<T extends Constructor>(
    module: T,
    root?: ModuleRef
  ): Promise<ModuleRef<T>>
  static async create<T extends Constructor>(
    module: DynamicModule | T,
    root?: ModuleRef
  ): Promise<ModuleRef<T>> {
    let options: ModuleOptions
    let ModuleConstructor: Constructor

    if (typeof module === 'function') {
      options = {
        imports: Reflect.getMetadata(MODULE_IMPORTS, module),
        exports: Reflect.getMetadata(MODULE_EXPORTS, module),
        providers: Reflect.getMetadata(MODULE_PROVIDER, module)
      }

      ModuleConstructor = module
    } else {
      options = module
      ModuleConstructor = module.module
    }

    const imports = new Set(options.imports || [])
    const exportedProviders = new Set(options.exports || [])
    const providers = new Set(
      (options.providers || []).sort((a, b) => {
        const depsA: any[] =
          typeof a === 'function'
            ? Reflect.getMetadata(PROVIDER_DEPENDENCIES, a) || []
            : []

        const tokenB = typeof b === 'function' ? b : b.provide

        return depsA.includes(tokenB) ? -1 : 0
      })
    )
    const ref = new ModuleRef(ModuleConstructor.name, new ModuleConstructor())

    // Init Submodules
    for (const submodule of imports) {
      const submoduleInstance = await this.create(submodule, ref)
      submoduleInstance.exports.forEach((provider, token) => {
        ref.importedProviders.set(token, provider)
      })
      ref.modules.set(submodule, submoduleInstance)
    }

    // Init Providers
    for (const provider of providers) {
      const token = typeof provider === 'function' ? provider : provider.provide
      ref.providers.set(token, new ProviderRef(provider, ref))
    }

    ref.providers.set(MODULE_REF, new ProviderRef({ useValue: ref }, ref))
    ref.providers.set(
      ROOT_MODULE_REF,
      new ProviderRef({ useValue: root || ref }, ref)
    )

    // Exports
    for (const provider of exportedProviders) {
      if (!ref.providers.has(provider)) {
        throw new Error(`${provider} not exists!`)
      }

      ref.exports.set(provider, ref.providers.get(provider) as ProviderRef)
    }

    if (ref.instance.onModuleInit) {
      ref.instance.onModuleInit()
    }

    return ref
  }
}
