# @injets/functional

A lightweight dependency injection library for JavaScript and TypeScript with functional programming.

## Installation

```bash
npm install @injets/core @injets/functional
```

## Usage

```typescript
import { createResolver } from '@injets/functional';

class MyService {
  constructor(
    private readonly hostname: string,
  ) {}

  send() {
    console.log('MyService send', this.hostname);
  }
}


const useConfig = createResolver('Config', ({ constant }) => {
  constant('hostname', 'localhost');
  constant('port', 3000);
})

const useApp = createResolver('App', ({ depends, transient, singleton, inject }) => {
  depends(useConfig)

  transient('random', () => Math.random());

  singleton(MyService, () => new MyService(inject('hostname')))
})

const [service, randomValue] = useApp(MyService, 'random');

console.log(service, randomValue);
```

## API

### Decorators

#### `createResolver(name: string, factory: ResolverFactory): Resolver`

Creates a resolver function for all providers defined in the factory.


## Options

#### `ResolverFactoryContext`

Resolver factory function context

```typescript
export interface ResolverFactoryContext {
  // injects a provider
  inject<T extends Token>(token: T): TokenValue<T>;
  // import all exported providers from another container
  depends(...containersOrResolvers: Array<ResolveFunction | Container>): void;
  // registers a provider in the container
  provide<T extends Token>(provider: Provider<T>): void;

  // registers a singleton provider in the container
  singleton<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;

  // registers a constant value provider in the container
  constant<T extends Token>(token: Token<T>, value: T, exportProvider?: boolean): void;

  // registers a transient provider in the container
  transient<T extends Token>(token: Token<T>, factory: () => T, exportProvider?: boolean): void;
  
  // registers all exported providers in global container
  global(): void;

  // container reference
  readonly container: Container;
}
```

## Other packages

- [@injets/decorators](https://npmjs.com/package/@injets/decorators) - Support for decorators in TypeScript.
- [@injets/core](https://npmjs.com/package/@injets/core) - A lightweight dependency injection library for Node.js and TypeScript.
