/** Class type. */
type Class<T, A extends Readonly<any[]> = any[]> = new (...args: A) => T;
type AbstractClass<T, A extends Readonly<any[]> = any[]> = abstract new (...args: A) => T;
type AnyClass<T> = Class<T> | AbstractClass<T>;
/** Token of a provider. */
type Token<T = unknown> = {};
/** Value of a token. */
type TokenValue<T> = T extends AnyClass<infer U> ? U : T extends Token<infer U> ? U : unknown;
/** Dependency list of a provider. */
type DependencyList<T = Token> = Readonly<T[]>;
type DependencyValues<T> = T extends DependencyList ? {
    [K in keyof T]: TokenValue<T[K]>;
} : unknown;
/** Provider of a token. */
declare enum ProviderMode {
    SINGLETON = "SINGLETON",
    TRANSIENT = "TRANSIENT"
}
interface WithExport {
    /** Export the token from the container. */
    export?: boolean;
}
interface WithInject<T extends DependencyList> {
    /** Inject providers into this container. */
    inject?: T;
}
interface WithMode {
    /** Provider mode. */
    mode?: ProviderMode;
}
interface WithToken<T> {
    /** Token of the provider. */
    token: Token<T>;
}
/** Factory provider. */
interface FactoryProvider<T = unknown, D extends DependencyList = DependencyList> extends WithToken<T>, WithExport, WithMode, WithInject<D> {
    /** Factory function to construct the provider. */
    useFactory(...args: D): T;
}
/** Value provider. */
interface ValueProvider<T = unknown> extends WithToken<T>, WithExport, WithMode {
    /** Token of the provider. */
    token: Token<T>;
    /** Value of the provider. */
    useValue: T;
}
/** Class provider. */
interface ClassProvider<T = unknown, D extends Readonly<unknown[]> = []> extends Partial<WithToken<T>>, WithExport, WithMode {
    /** Class type to construct the provider. */
    useClass: Class<T, D>;
    /** Dependency list to inject into the class. */
    inject?: {
        [K in keyof D]: Token<D[K]>;
    };
}
/** Provider. */
type Provider<T = unknown, D extends DependencyList = any[]> = FactoryProvider<T, D> | ValueProvider<T> | ClassProvider<T, D>;

interface ContainerOptions {
    name?: string;
    isGlobal?: boolean;
    defaultExport?: boolean;
    imports?: Container[];
    providers?: Provider[];
}
declare class Container<T extends Token = Token> {
    #private;
    isGlobal: boolean;
    static global: Container<Token>;
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
    resolve<const U extends Readonly<T[]>>(tokens?: U, includePrivate?: boolean): DependencyValues<U>;
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
    provide<T, D extends DependencyList>(provider: Provider<T, D>): void;
    /**
     * Import all exported tokens from another container.
     * @param container Container to import from.
     * @example
     * container.import(otherContainer);
     * container.resolve(Foo); // Foo is exported from otherContainer
     */
    import(container: Container): void;
    /**
     * Export a token from the container.
     * @param token Token to export.
     * @example
     * container.export(Foo);
     */
    export(token: Token): void;
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
    constructor(options?: ContainerOptions);
}

declare class Delayed<T = unknown> {
    #private;
    private static reflectMethods;
    constructor(factory: () => T);
    createProxy(factory: (ctor: T) => T): T;
}
/**
 * Delay the resolution of a token.
 * @param factory Factory function to construct the token.
 * @returns Delayed token.
 * @example
 * const foo = container.resolve(delay(() => Foo));
 */
declare function delayed<T extends Token>(factory: () => T): T;

/** Get the name of a token. */
declare function tokenName(token: Token): string;
/** Check if a provider is a value provider. */
declare function isValueProvider(provider: Provider): provider is ValueProvider;
/** Check if a provider is a class provider. */
declare function isClassProvider<T, D extends DependencyList>(provider: Provider<T, D>): provider is ClassProvider<T, D>;
/** Check if a provider is a factory provider. */
declare function isFactoryProvider<T, D extends DependencyList>(provider: Provider<T, D>): provider is FactoryProvider<T, D>;
/** Check if a provider is a class or factory provider. */
declare function providerModeIs<M extends ProviderMode>(provider: {
    mode?: ProviderMode;
}, mode: M): provider is Provider & {
    mode: M;
};

export { type AbstractClass, type AnyClass, type Class, type ClassProvider, Container, type ContainerOptions, Delayed, type DependencyList, type DependencyValues, type FactoryProvider, type Provider, ProviderMode, type Token, type TokenValue, type ValueProvider, type WithExport, type WithInject, type WithMode, type WithToken, delayed, isClassProvider, isFactoryProvider, isValueProvider, providerModeIs, tokenName };
