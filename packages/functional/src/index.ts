import { Container, ProviderMode, type DependencyValues, type Provider, type Token, type TokenValue } from '@injets/core';

export interface ResolveFunction<T extends Token = Token> {
  container: Container<T>;
  <const U extends Readonly<T[]>>(...tokens: U): DependencyValues<U>;
}

export interface ResolverFactoryContext {
  /** @deprecated Use `inject` instead. */
  inject<T extends Token>(token: T): TokenValue<T>;

  /** @deprecated Use `depends` instead. */
  depends(...containersOrResolvers: Array<ResolveFunction | Container>): void;

  /** @deprecated Use `provide` instead. */
  provide<T extends Token>(provider: Provider<T>): void;

  /** @deprecated Use `singleton` instead. */
  singleton<T extends Token>(
    token: Token<T>,
    factory: () => T,
    exportProvider?: boolean
  ): void;

  /** @deprecated Use `constant` instead. */
  constant<T extends Token>(
    token: Token<T>,
    value: T,
    exportProvider?: boolean
  ): void;

  /** @deprecated Use `transient` instead. */
  transient<T extends Token>(
    token: Token<T>,
    factory: () => T,
    exportProvider?: boolean
  ): void;

  /** @deprecated Use `global` instead. */
  global(): void;

  /** @deprecated Use `getParentContainer` instead. */
  readonly container: Container;
}

let currentContainer: Container | null = null;

export function getParentContainer() {
  if (!currentContainer) {
    throw new Error('No container is currently active.');
  }

  return currentContainer;
}

export function runInContainer<T>(container: Container, cb: () => T) {
  const lastContainer = currentContainer;
  
  currentContainer = container;

  const result = cb();

  currentContainer = lastContainer;

  return result;
}

export function bindToContainer<A extends any[], R>(fn: (...args: A) => R) {
  return (...args: A): R => runInContainer(getParentContainer(), () => fn(...args));
}

/**
 * Inject a dependency from the current container.
 * @param token 
 * @returns 
 */
export function inject<T extends Token>(token: T): TokenValue<T> {
  return getParentContainer().resolve(token);
}

/**
 * Import dependencies from other containers.
 * @param containersOrResolvers
 * @returns
 */
export function depends(...containersOrResolvers: Array<ResolveFunction | Container>) {
  const currentContainer = getParentContainer();

  for (const resolver of containersOrResolvers) {
    if (resolver instanceof Container) {
      currentContainer.import(resolver);
      continue;
    }

    if (
      typeof resolver === 'function' &&
          resolver.container instanceof Container
    ) {
      currentContainer.import(resolver.container);
      continue;
    }

    throw new TypeError('Invalid container or resolver.');
  }
}

/**
 * Provide a dependency to the current container.
 * @param provider
 * @returns
 */
export function provide<T extends Token>(provider: Provider<T>) {
  getParentContainer().provide(provider);
}

/**
 * Register a singleton dependency to the current container.
 * @param token 
 * @param factory 
 * @param exportProvider 
 */
export function singleton<T extends Token>(
  token: Token<T>,
  factory: () => T,
  exportProvider = true,
) {
  getParentContainer().provide({
    token,
    mode: ProviderMode.SINGLETON,
    useFactory: bindToContainer(factory),
    export: exportProvider,
  });
}

/**
 * Register a constant dependency to the current container.
 * @param token
 * @param value
 * @param exportProvider
 * @returns
 */
export function constant<T extends Token>(
  token: Token<T>,
  value: T,
  exportProvider = true,
) {
  getParentContainer().provide({
    token,
    useValue: value,
    export: exportProvider,
  });
}

/**
 * Register a transient dependency to the current container.
 * @param token
 * @param factory
 * @param exportProvider
 * @returns
 */
export function transient<T extends Token>(
  token: Token<T>,
  factory: () => T,
  exportProvider = true,
) {
  getParentContainer().provide({
    token,
    useFactory: bindToContainer(factory),
    mode: ProviderMode.TRANSIENT,
    export: exportProvider,
  });
}

/**
 * Make the current container global.
 * @returns
 */
export function global() {
  const container = getParentContainer();

  if (container.isGlobal) {
    return;
  }

  container.isGlobal = true;

  Container.global.import(container);
}

function createResolverFactoryContext(container: Container): ResolverFactoryContext {
  return {
    inject,
    global,
    depends,
    provide,
    singleton,
    constant,
    transient,
    container,
  };
}

/** Create a resolver function for a existing container. */
export function createResolverForContainer<T extends Token>(container: Container<T>): ResolveFunction<T> {
  const resolve = ((...tokens: T[]) =>
    runInContainer(container, () => container.resolve(tokens))) as ResolveFunction<T> ;

  resolve.container = container;

  return resolve;
}
/**
 * Create a new container and a resolver function for it.
 * @param name 
 * @param factory 
 * @returns 
 */
export function createResolver(name: string, factory: () => void): ResolveFunction;

/**
 * Create a new container and a resolver function for it.
 * @deprecated use factory without context instead.
 * @param name 
 * @param factory 
 * @returns 
 */
export function createResolver(
  name: string,
  factory: (context: ResolverFactoryContext) => void
): ResolveFunction;


export function createResolver(
  name: string,
  factory: (context: ResolverFactoryContext) => void,
): ResolveFunction {
  return runInContainer(new Container({ name }), () => {
    const container = getParentContainer();
    factory(createResolverFactoryContext(container));
    return createResolverForContainer(container);
  });
}
