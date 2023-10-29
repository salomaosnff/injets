/** Class type. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Class<T, A extends Readonly<any[]> = any[]> = new (...args: A) => T

/** Token of a provider. */
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
export type Token<T = unknown> = {}

/** Value of a token. */
export type TokenValue<T> = T extends Class<infer U> ? U : T extends Token<infer U> ? U : unknown

/** Dependency list of a provider. */
export type DependencyList<T = Token> = Readonly<T[]>

export type DependencyValues<T> = T extends DependencyList ? {
  [K in keyof T]: TokenValue<T[K]>
} : unknown

/** Provider of a token. */
export enum ProviderMode {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
}

export interface WithExport {
  /** Export the token from the container. */
  export?: boolean
}

export interface WithInject<T extends DependencyList> {
  /** Inject providers into this container. */
  inject?: T
}

export interface WithMode {
  /** Provider mode. */
  mode?: ProviderMode
}

export interface WithToken<T> {
  /** Token of the provider. */
  token: Token<T>
}

/** Factory provider. */
export interface FactoryProvider<T = unknown, D extends DependencyList = DependencyList> extends WithToken<T>, WithExport, WithMode, WithInject<D> {
  /** Factory function to construct the provider. */
  useFactory(...args: D): T
}

/** Value provider. */
export interface ValueProvider<T = unknown> extends WithToken<T>, WithExport, WithMode {
  /** Token of the provider. */
  token: Token<T>

  /** Value of the provider. */
  useValue: T
}

/** Class provider. */
export interface ClassProvider<T = unknown, D extends Readonly<unknown[]> = []> extends Partial<WithToken<T>>, WithExport, WithMode {
  /** Class type to construct the provider. */
  useClass: Class<T, D>

  /** Dependency list to inject into the class. */
  inject?: {
    [K in keyof D]: Token<D[K]>
  }
}

/** Provider. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Provider<T = unknown, D extends DependencyList = any[]> = FactoryProvider<T, D> | ValueProvider<T> | ClassProvider<T, D>