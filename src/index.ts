import type { Token, Provider, ContainerResolver } from './types';
import { throwCyclicError as throwNodeError } from './errors.node-env';
import { throwCyclicError as throwBrowserError } from './errors.browser-env';

export * from './types';

const PROXY_HANDLE_KEYS = [
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
] as const;



/** Get the name of a token. */
export function tokenName(token: Token) {
  if (typeof token === 'function') {
    return token.name;
  }

  return String(token);
}

/**
 * Create a token for a provider.
 * @param token Token to register.
 * @returns Token.
 */
export function defineToken<T>(name: string): Token<T> {
  return Symbol(name);
}
const resolveStack: [container: Container, token: Token, isLazy?: boolean][] = [];
declare global {
  interface ImportMeta {
    NODE?: boolean;
  }
}


const throwCyclicError = import.meta.NODE !== false ? throwNodeError : throwBrowserError;

class Container {
  #providers = new Map<Token, Provider>();

  constructor(readonly name: string) {}

  resolve(token: Token) {
    if (token instanceof Lazy) {
      const parentToken = resolveStack[resolveStack.length - 1]?.[1];
      return token.toProxy(this, parentToken ?? token, (token) => this.resolve(token));
    }

    const cyclicIndex = resolveStack.findIndex(([
      c,
      t,
    ]) => c === this && t === token);
    
    if (cyclicIndex >= 0) {
      const stack = resolveStack.map(([
        c,
        t,
        isLazy,
      ]) => ({
        containerName: c.name,
        token: t,
        isLazy,
      }));
      throwCyclicError(stack, cyclicIndex, token);
    }

    resolveStack.push([
      this,
      token,
      false,
    ]);
    
    const provider = this.#providers.get(token);

    if (typeof provider !== 'function') {
      throw new Error(`Provider "${tokenName(token)}" not found in container "${this.name}"`);
    }

    const value = provider();

    resolveStack.pop();

    return value;
  }

  provide<T>(token: Token<T>, factory: Provider<T>) {
    if (this.#providers.has(token)) {
      throw new Error(`Provider "${tokenName(token)}" already exists in "${this.name}" container.`);
    }

    this.#providers.set(token, factory);
  }
}

let activeContainer: Container | null = null;

export function getActiveContainer(): Container {
  if (activeContainer) {
    return activeContainer;
  }

  throw new Error('No active container! Registration functions (transient, singleton, constant) can only be called within the body of "defineContainer".');
}

function callContainer(container: Container, cb: () => void) {
  const lastContainer = activeContainer;
  activeContainer = container;
  cb();
  activeContainer = lastContainer;
}

export function transient<T>(token: Token<T>, factory: Provider<T>) {
  getActiveContainer().provide(token, factory);
}

export function singleton<T>(token: Token<T>, factory: Provider<T>) {
  let cache: T;

  getActiveContainer().provide(token, () => {
    cache ??= factory();
    return cache;
  });
}

export function constant<T>(token: Token<T>, value: T) {
  getActiveContainer().provide(token, () => value);
}

export function defineContainer(name: string, factory: () => void) {
  const container = new Container(name);
  
  callContainer(container, factory);

  const resolver: ContainerResolver = function resolve(tokens: Token | Token[]) {
    if (Array.isArray(tokens)) {
      return tokens.map((token) => container.resolve(token));
    }

    return container.resolve(tokens);
  };

  resolver.asyncResolve = async function resolve(tokens: Token | Token[]) {
    const result = resolver(tokens);

    if (Array.isArray(result)) {
      return Promise.all(result) as Promise<any[]>;
    }

    return result as any;
  };

  return resolver;
}

class Lazy<T> {
  _?: T;
  #getToken: () => Token<T>;

  constructor(getToken: () => Token<T>) {
    this.#getToken = getToken;
  }

  toProxy(container: Container, parentToken: Token, get: (token: Token<T>) => T) {
    let cache: T;
    const getValue = () => {
      cache ??= get(this.#getToken());
      return cache;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = {} as Record<typeof PROXY_HANDLE_KEYS[number], any>;

    for (const method of PROXY_HANDLE_KEYS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler[method] = (_: any, ...args: any[]) => {
        console.log('Proxy trap called for method:', method);
        const cyclicIndex = resolveStack.findIndex(([c, t]) => c === container && t === parentToken);
        if (cyclicIndex >= 0) {
          const stack = resolveStack.map(([
            c,
            t,
            isLazy,
          ]) => ({
            containerName: c.name,
            token: t,
            isLazy,
          }));
          throwCyclicError(stack, cyclicIndex, this.#getToken());
        }

        resolveStack.push([
          container,
          parentToken,
          true,
        ]);
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (Reflect as any)[method](getValue(), ...args);
        }
        finally {
          resolveStack.pop();
        }
      };
    }

    const proxy = new Proxy({}, handler);
    return proxy;
  }
}

export function lazy<T>(token: () => Token<T>): Token<T> {
  return new Lazy(token);
}