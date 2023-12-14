import { Token, Container, DependencyValues, TokenValue, Provider } from '@injets/core';
export { Container, ProviderMode, Token, delayed } from '@injets/core';

interface ResolveFunction<T extends Token = Token> {
    container: Container<T>;
    /**
     * Resolve all tokens in a dependency list.
     * @param tokens Dependency list.
     * @returns Resolved values.
     */
    <const U extends Readonly<T[]>>(tokens: U): DependencyValues<U>;
    /**
     * Resolve a token.
     * @param token Token to resolve.
     * @returns Resolved value.
     */
    <const U extends T>(token: U): TokenValue<U>;
}
interface ResolverFactoryContext {
    /** @deprecated Use `inject` instead. */
    inject<T extends Token>(token: T): TokenValue<T>;
    /** @deprecated Use `depends` instead. */
    depends(...containersOrResolvers: Array<ResolveFunction | Container>): void;
    /** @deprecated Use `provide` instead. */
    provide<T extends Token>(provider: Provider<T>): void;
    /** @deprecated Use `singleton` instead. */
    singleton<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;
    /** @deprecated Use `constant` instead. */
    constant<T extends Token>(token: Token<T>, value: T, exportProvider?: boolean): void;
    /** @deprecated Use `transient` instead. */
    transient<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;
    /** @deprecated Use `global` instead. */
    global(): void;
    /** @deprecated Use `getParentContainer` instead. */
    readonly container: Container;
}
declare function getParentContainer(): Container<Token<unknown>>;
declare function runInContainer<T>(container: Container, cb: () => T): T;
declare function bindToContainer<A extends any[], R>(fn: (...args: A) => R): (...args: A) => R;
/**
 * Inject a dependency from the current container.
 * @param token
 * @returns
 */
declare function inject<T extends Token>(token: T): TokenValue<T>;
/**
 * Import dependencies from other containers.
 * @param containersOrResolvers
 * @returns
 */
declare function depends(...containersOrResolvers: Array<ResolveFunction | Container>): void;
/**
 * Provide a dependency to the current container.
 * @param provider
 * @returns
 */
declare function provide<T extends Token>(provider: Provider<T>): void;
/**
 * Register a singleton dependency to the current container.
 * @param token
 * @param factory
 * @param exportProvider
 */
declare function singleton<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;
/**
 * Register a constant dependency to the current container.
 * @param token
 * @param value
 * @param exportProvider
 * @returns
 */
declare function constant<T extends Token>(token: Token<T>, value: T, exportProvider?: boolean): void;
/**
 * Register a transient dependency to the current container.
 * @param token
 * @param factory
 * @param exportProvider
 * @returns
 */
declare function transient<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;
/**
 * Make the current container global.
 * @returns
 */
declare function global(): void;
/** Create a resolver function for a existing container. */
declare function createResolverForContainer<T extends Token>(container: Container<T>): ResolveFunction<T>;
/**
 * Create a new container and a resolver function for it.
 * @param name
 * @param factory
 * @returns
 */
declare function createResolver(name: string, factory: () => void): ResolveFunction;
/**
 * Create a new container and a resolver function for it.
 * @deprecated use factory without context instead.
 * @param name
 * @param factory
 * @returns
 */
declare function createResolver(name: string, factory: (context: ResolverFactoryContext) => void): ResolveFunction;

export { type ResolveFunction, type ResolverFactoryContext, bindToContainer, constant, createResolver, createResolverForContainer, depends, getParentContainer, global, inject, provide, runInContainer, singleton, transient };
