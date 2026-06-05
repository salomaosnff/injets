/**
 * Represent a token for a provider.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Token<T = any> = {_?: T} | (new (...args: any[]) => T) | symbol | string | number | object

/**
 * Represent a provider factory
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Provider<T = any> = () => T

export interface ContainerResolver {
  <T>(token: Token<T>): T

  <const T extends Token[]>(tokens: T): {
    [K in keyof T]: T[K] extends Token<infer U> ? U : unknown
  }

  asyncResolve<T>(token: Token<T>): Promise<T>

  asyncResolve<const T extends Token[]>(tokens: T): Promise<{
    [K in keyof T]: T[K] extends Token<infer U> ? U : unknown
  }>
}
