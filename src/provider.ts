import { ProviderOptions, Constructor } from './types'
import { ModuleRef } from './module'
import { PROVIDER_SCOPE } from './meta/provider.meta'

export class ProviderRef<T = any> {
  private instance!: T
  private options: ProviderOptions = {}

  constructor(
    optionsOrConstructor: ProviderOptions | Constructor,
    private module: ModuleRef
  ) {
    if (typeof optionsOrConstructor === 'function') {
      this.options = {
        useClass: optionsOrConstructor,
        provide: optionsOrConstructor,
        scope:
          Reflect.getMetadata(PROVIDER_SCOPE, optionsOrConstructor) ||
          'SINGLETON'
      }
    } else {
      this.options = optionsOrConstructor
    }
  }

  static async create<T extends any>(
    optionsOrConstructor: ProviderOptions | Constructor,
    moduleRef: ModuleRef
  ): Promise<T> {
    let ProviderConstructor: Constructor | undefined

    if (typeof optionsOrConstructor === 'function') {
      ProviderConstructor = optionsOrConstructor
    } else if (typeof optionsOrConstructor.useClass === 'function') {
      ProviderConstructor = optionsOrConstructor.useClass
    } else if (typeof optionsOrConstructor.useFactory === 'function') {
      return optionsOrConstructor.useFactory()
    }

    if (ProviderConstructor) {
      const paramtypes =
        Reflect.getMetadata('design:paramtypes', ProviderConstructor) || []
      const args = await Promise.all(
        paramtypes.map((p: any) => moduleRef.get(p))
      )
      return new ProviderConstructor(...args)
    }

    return (optionsOrConstructor as ProviderOptions).useValue
  }

  factory(): Promise<T> {
    if (typeof this.options.useFactory === 'function') {
      return this.options.useFactory()
    }

    if (typeof this.options.useClass === 'function') {
      return ProviderRef.create(this.options, this.module)
    }

    return this.options.useValue
  }

  async get(): Promise<T> {
    if (!this.options.scope || this.options.scope === 'SINGLETON') {
      if (this.instance) return this.instance
      return (this.instance = await this.factory())
    }

    return this.factory()
  }
}
