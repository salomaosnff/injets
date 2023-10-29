import { Delayed } from './delayed';
import type { ClassProvider, DependencyList, DependencyValues, Provider, Token, TokenValue } from './types';
import { ProviderMode } from './types';
import { isClassProvider,
  isFactoryProvider,
  isValueProvider,
  providerModeIs,
  tokenName } from './util';

export interface ContainerOptions {
  name?: string
  isGlobal?: boolean
  defaultExport?: boolean
  imports?: Container[]
  providers?: Provider[]
}

export class Container<T extends Token = Token> {
  #name: string;
  #export: boolean;
  #cache = new Map<Token, unknown>();
  #imported = new Map<Token, Container>();
  #providers = new Map<Token, Provider>();
  #exported = new Set<Token>();

  isGlobal: boolean;

  static global = new Container({ name: 'global' });

  #resolveProvider<U, D extends Readonly<T[]>>(provider: Provider<U, D>): U {
    const token = provider.token ?? (provider as ClassProvider<U>).useClass;
    const instance = this.#construct(provider);

    if (providerModeIs(provider, ProviderMode.SINGLETON)) {
      this.#cache.set(token, instance);
    }

    return instance;
  }

  /**
   * Resolve all tokens in a dependency list.
   * @param tokens Dependency list.
   * @param includePrivate Include private providers.
   * @returns Resolved values.
   * @throws {Error} If a provider is not found.
   * @throws {TypeError} If a circular dependency is detected.
   * @example
   * const [foo, bar] = container.resolve([Foo, Bar]);
   */
  resolve<const U extends Readonly<T[]>>(tokens?:U, includePrivate?: boolean): DependencyValues<U>;
  /**
   * Resolve a token.
   * @param token Token to resolve.
   * @param includePrivate Include private providers.
   * @returns Resolved value.
   * @throws {Error} If a provider is not found.
   * @throws {TypeError} If a circular dependency is detected.
   * @example
   * const foo = container.resolve(Foo);
   * const bar = container.resolve(Bar);
   */
  resolve<const U extends T>(token: U, includePrivate?: boolean): TokenValue<U>;
  resolve(tokenOrTokenList: Token | Token[], includePrivate?: boolean) {
    if (Array.isArray(tokenOrTokenList)) {
      return tokenOrTokenList.map(token => this.resolve(token, includePrivate));
    }

    const token = tokenOrTokenList;

    if (typeof token === 'undefined') {
      throw new TypeError(`Possible circular dependency detected in ${this.#name
      } container.
Token is undefined.
Try to use "delay(() => <token>)" function to delay the resolution of the token.`);
    }

    if (token instanceof Delayed) {
      return token.createProxy(ctor => this.resolve(ctor));
    }

    if (this.#cache.has(token)) {
      return this.#cache.get(token);
    }

    if (this.#providers.has(token)) {
      if (!includePrivate && !this.#exported.has(token)) {
        throw new Error(
          `Provider "${tokenName(token)}" is not exported from container "${this.#name}"`,
        );
      }
      const provider = this.#providers.get(token)!;
      return this.#resolveProvider(provider);
    }

    if (this.#imported.has(token)) {
      const container = this.#imported.get(token)!;
      return container.resolve(token);
    }

    try {
      return Container.global.resolve(token);
    }
    catch {
      // ignore
    }

    throw new Error(
      `Provider "${tokenName(token)}" not found in container "${this.#name}"`,
    );
  }

  /**
   * Provide a token in the container.
   * @param provider Provider to register.
   * @throws {Error} If the provider is invalid.
   * @example
   * container.provide({ token: Foo, useClass: Foo });
   * container.provide({ token: Bar, useValue: bar });
   * container.provide({ token: Baz, useFactory: () => baz });
   * container.provide({ token: Qux, useClass: Qux, inject: [Foo, Bar, Baz] });
   */
  provide<T, D extends DependencyList>(provider: Provider<T, D>) {
    const token
      = provider.token ?? (provider as ClassProvider).useClass;

    if (isClassProvider(provider) || isFactoryProvider(provider)) {
      provider.mode ??= ProviderMode.SINGLETON;
    }

    if (!token) {
      throw new Error('Provider must have a token or a useClass property');
    }

    this.#providers.set(token, provider as Provider);

    if (provider.export ?? this.#export) {
      this.export(token);
    }

    if (this.isGlobal) {
      Container.global.#imported.set(token, this);
    }
  }

  /**
   * Import all exported tokens from another container.
   * @param container Container to import from.
   * @example
   * container.import(otherContainer);
   * container.resolve(Foo); // Foo is exported from otherContainer
   */
  import(container: Container) {
    for (const token of container.#exported) {
      this.#imported.set(token, container);
    }
  }

  /**
   * Export a token from the container.
   * @param token Token to export.
   * @example
   * container.export(Foo);
   */
  export(token: Token) {
    if (this.#providers.has(token)) {
      this.#exported.add(token);
      return;
    }

    throw new Error(
      `Cannot export "${tokenName(token)}" from container "${this.#name
      }" because it is not registered`,
    );
  }

  #construct<U, D extends DependencyList<T>>(provider: Provider<U, D>): U {
    if (isClassProvider(provider)) {
      const dependencies = this.resolve((provider.inject ?? []) as D, true);

      return new provider.useClass(...dependencies as D);
    }

    if (isFactoryProvider(provider)) {
      const dependencies = this.resolve(provider.inject ?? [], true);
      return provider.useFactory(...dependencies as D);
    }

    if (isValueProvider(provider)) {
      return provider.useValue;
    }

    throw new Error('Providers must be a class, factory, or value');
  }

  /**
   * Create a new dependency injection container.
   * @param options Container options.
   * @example
   * const container = new Container({
   *  name: 'MyContainer', // recommended
   *  imports: [OtherContainer],
   *  providers: [
   *   { token: Foo, useClass: Foo },
   *  ]
   * });
   * container.resolve(Foo); // Foo
   */
  constructor(options: ContainerOptions = {}) {
    this.isGlobal = options.isGlobal ?? false;
    this.#name = options.name ?? this.constructor.name;
    this.#export = options.defaultExport ?? true;

    for (const container of options.imports ?? []) {
      this.import(container);
    }

    for (const provider of options.providers ?? []) {
      this.provide(provider);
    }
  }
}
