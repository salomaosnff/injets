import { Token, Container, DependencyValues, TokenValue, Provider } from '@injets/core';
export { Container, Token, delayed } from '@injets/core';

interface ResolveFunction<T extends Token = Token> {
    container: Container<T>;
    <const U extends Readonly<T[]>>(...tokens: U): DependencyValues<U>;
}
interface ResolverFactoryContext {
    inject<T extends Token>(token: T): TokenValue<T>;
    depends(...containersOrResolvers: Array<ResolveFunction | Container>): void;
    provide<T extends Token>(provider: Provider<T>): void;
    singleton<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;
    constant<T extends Token>(token: Token<T>, value: T, exportProvider?: boolean): void;
    transient<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;
    readonly container: Container;
}
/** Create a resolver function for a existing container. */
declare function createResolverForContainer<T extends Token>(container: Container<T>): ResolveFunction<T>;
declare function createResolver(name: string, factory: (context: ResolverFactoryContext) => void): ResolveFunction;

export { ResolveFunction, ResolverFactoryContext, createResolver, createResolverForContainer };
