import type { Token } from './types';

export class Delayed<T = unknown> {
  private static reflectMethods: ReadonlyArray<keyof ProxyHandler<object>> = [
    'get',
    'getPrototypeOf',
    'setPrototypeOf',
    'getOwnPropertyDescriptor',
    'defineProperty',
    'has',
    'set',
    'deleteProperty',
    'apply',
    'construct',
    'ownKeys',
  ];

  #wrap: () => T;

  constructor(factory: () => T) {
    this.#wrap = factory;
  }

  createProxy(factory: (ctor: T) => T): T {
    let cache: T;
    const getValue = () => (cache ??= factory(this.#wrap()));
    const handler: object = { };

    for (const method of Delayed.reflectMethods) {
      // @ts-expect-error Ignore index signature.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler[method] = (_: T, ...args: any[]) =>
        // eslint-disable-next-line @typescript-eslint/ban-types
        (Reflect[method] as Function)(getValue(), ...args);
    }

    return new Proxy({}, handler) as T;
  }
}

/**
 * Delay the resolution of a token.
 * @param factory Factory function to construct the token.
 * @returns Delayed token.
 * @example
 * const foo = container.resolve(delay(() => Foo));
 */
export function delayed<T extends Token>(factory: () => T): T {
  return new Delayed(factory) as unknown as T;
}
