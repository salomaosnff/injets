export type Constructor<T = any> = new (...args: any[]) => T

export interface ModuleOptions {
  global?: boolean;
  imports?: any[];
  providers?: Array<Constructor|ProviderOptions>;
  exports?: Array<any>;
}

export interface DynamicModule extends ModuleOptions {
  module: Constructor;
}

export interface ProviderOptions {
  provide?: any;
  scope?: 'SINGLETON' | 'TRANSIENT';
  groups?: Array<string | symbol | number>;
  useValue?: any;
  useClass?: Constructor;
  useFactory?(): any;
}

export type Conditional<T extends boolean, TT, FT> = T extends true ? TT : FT