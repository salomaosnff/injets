export type Constructor<T = any> = new (...args: any[]) => T

export interface ModuleOptions {
  imports?: any[]
  providers?: Array<Constructor|ProviderOptions>
  exports?: Array<Constructor|ProviderOptions>
}

export interface DynamicModule extends ModuleOptions {
  module: Constructor
}

export interface ProviderOptions {
  provide?: any
  scope?: 'SINGLETON' | 'TRANSIENT'
  useValue?: any
  useClass?: Constructor
  useFactory?(): Promise<any>
}
