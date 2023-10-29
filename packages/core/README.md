# @injets/core

A lightweight dependency injection library for Node.js and TypeScript.

## Installation

```bash
npm install @injets/core
```

## Usage

```typescript
import { Container } from '@injets/core';

class MyService {
  constructor() {
    console.log('MyService constructed');
  }

  method() {
    console.log('MyService method');
  }
}

const container = new Container();

container.provide({
  token: 'myService',
  useClass: MyService,
})

const myService = container.resolve('myService');
```

## API

### Container

#### `constructor(options: ContainerOptions = {})`

Creates a new container instance.

#### `provide<T>(provider: Provider<T>): void`

Registers a provider in the container.

#### `resolve<T>(token: Token<T>): T`

Resolves a provider from the container.

#### `resolve<T extends Token[]>(tokens: T): DependencyValues<T>`

Resolves multiple providers from the container.

#### `import(container: Container): void`

Imports all exported providers from another container.

#### `export(token: Token): void`

Exports a provider from the container.


### Provider

Exists many types of providers:

#### `ClassProvider<T>`

Provide a instance of a class.

```typescript
interface ClassProvider<T> {
  token: Token<T>;
  useClass: Class<T>;
  mode?: ProviderMode;
}
```

#### `FactoryProvider<T>`

Provide a value of a factory.

```typescript
interface FactoryProvider<T> {
  token: Token<T>;
  useFactory: Factory<T>;
  mode?: ProviderMode;
}
```

#### `ValueProvider<T>`

Provide a value.

```typescript
interface ValueProvider<T> {
  token: Token<T>;
  useValue: T;
  mode?: ProviderMode;
}
```

## Options

#### `ContainerOptions`

Options for the container.

```typescript
interface ContainerOptions {
  isGlobal?: boolean;
  imports?: Container[];
  providers?: Provider[];
  exports?: Token[];
}
```

#### `ProviderMode`

Mode of the provider.

```typescript
enum ProviderMode {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT',
}
```

#### `Provider`

A provider can be a class, a factory or a value.

```typescript
type Provider<T> = ClassProvider<T> | FactoryProvider<T> | ValueProvider<T>;
```

#### `Token<T>`

A token is a unique identifier for a provider.

```typescript
type Token<T = any> = string | symbol | Class<T>;
```

## Other packages

- [@injets/functional](https://npmjs.com/package/@injets/functional) - Support for functional programming in JavaScript and TypeScript.
- [@injets/decorators](https://npmjs.com/package/@injets/decorators) - Support for decorators in TypeScript.
