/**
 * Represent a token for a provider.
 */
type Token<T = any> = {
    _?: T;
} | (new (...args: any[]) => T) | symbol | string | number | object;
/**
 * Represent a provider factory
 */
type Provider<T = any> = () => T;
interface ContainerResolver {
    <T>(token: Token<T>): T;
    <const T extends Token[]>(tokens: T): {
        [K in keyof T]: T[K] extends Token<infer U> ? U : unknown;
    };
    asyncResolve<T>(token: Token<T>): Promise<T>;
    asyncResolve<const T extends Token[]>(tokens: T): Promise<{
        [K in keyof T]: T[K] extends Token<infer U> ? U : unknown;
    }>;
}

/** Get the name of a token. */
declare function tokenName(token: Token): string;
/**
 * Create a token for a provider.
 * @param token Token to register.
 * @returns Token.
 */
declare function defineToken<T>(name: string): Token<T>;
declare global {
    interface ImportMeta {
        NODE?: boolean;
    }
}
declare class Container {
    #private;
    readonly name: string;
    constructor(name: string);
    resolve(token: Token): any;
    provide<T>(token: Token<T>, factory: Provider<T>): void;
}
declare function getActiveContainer(): Container;
declare function transient<T>(token: Token<T>, factory: Provider<T>): void;
declare function singleton<T>(token: Token<T>, factory: Provider<T>): void;
declare function constant<T>(token: Token<T>, value: T): void;
declare function defineContainer(name: string, factory: () => void): ContainerResolver;
declare function lazy<T>(token: () => Token<T>): Token<T>;

export { type ContainerResolver, type Provider, type Token, constant, defineContainer, defineToken, getActiveContainer, lazy, singleton, tokenName, transient };
