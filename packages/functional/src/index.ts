import { Container, ProviderMode, type DependencyValues, type Provider, type Token, type TokenValue } from '@injets/core';

export interface ResolveFunction<T extends Token = Token> {
  container: Container<T>;
  <const U extends Readonly<T[]>>(...tokens: U): DependencyValues<U>;
}

export interface ResolverFactoryContext {
  inject<T extends Token>(token: T): TokenValue<T>;
  depends(...containersOrResolvers: Array<ResolveFunction | Container>): void;
  provide<T extends Token>(provider: Provider<T>): void;
  singleton<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;
  constant<T extends Token>(token: Token<T>, value: T, exportProvider?: boolean): void;
  transient<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;
  global(): void;
  readonly container: Container;
}

function createResolverFactoryContext(name: string): ResolverFactoryContext {
  const currentContainer = new Container({ name });

  function depends(...containersOrResolvers: Array<ResolveFunction | Container>) {
    for (const resolver of containersOrResolvers) {
      if (resolver instanceof Container) {
        currentContainer.import(resolver);
        continue;
      }

      if (typeof resolver === 'function' && resolver.container instanceof Container) {
        currentContainer.import(resolver.container);
        continue;
      }

      throw new TypeError('Invalid container or resolver.');
    }
  }

  function provide<T extends Token>(provider: Provider<T>) {
    currentContainer.provide(provider);
  }

  function singleton<T extends Token>(token: Token<T>, factory: () => T, exportProvider = true) {
    currentContainer.provide({
      token,
      mode: ProviderMode.SINGLETON,
      useFactory: factory,
      export: exportProvider,
    });
  }

  function constant<T extends Token>(token: Token<T>, value: T, exportProvider = true) {
    currentContainer.provide({
      token,
      useValue: value,
      export: exportProvider,
    });
  }

  function transient<T extends Token>(token: Token<T>, factory: () => T, exportProvider = true) {
    currentContainer.provide({
      token,
      useFactory: factory,
      mode: ProviderMode.TRANSIENT,
      export: exportProvider,
    });
  }

  function inject<T extends Token>(token: T): TokenValue<T> {
    return currentContainer.resolve(token);
  }

  function global() {
    if (currentContainer.isGlobal) {
      return;
    }

    currentContainer.isGlobal = true;
    Container.global.import(currentContainer);
  }

  return {
    inject,
    global,
    depends,
    provide,
    singleton,
    constant,
    transient,
    container: currentContainer,
  };
}

/** Create a resolver function for a existing container. */
export function createResolverForContainer<T extends Token>(container: Container<T>): ResolveFunction<T> {
  const resolve: ResolveFunction<T> = (...tokens) => container.resolve(tokens);

  resolve.container = container;

  return resolve;
}

export function createResolver(name: string, factory: (context: ResolverFactoryContext) => void): ResolveFunction {
  const context = createResolverFactoryContext(name);

  factory(context);

  return createResolverForContainer(context.container);
}
