# @injets/decorators

A lightweight dependency injection library for Node.js and TypeScript with decorators.

## Installation

```bash
npm install @injets/core @injets/decorators
```

## Usage

```typescript
import { Container, Provider, Inject, mount } from '@injets/decorators';

@Provider()
class Provider1 {
  method() {
    console.log('Provider1 method');
  }
}

@Provider()
class Provider2 {
  @Inject()
  provider1!: Provider1;

  method() {
    console.log('Provider2 method', this.provider1);
  }
}

@Module({
  providers: [Provider1, Provider2],
})
class MyApp {}

const app = mount(MyApp)

app.resolve(Provider2).method(); // Provider2 method Provider1 {}
```

## API

### Decorators

#### `Module(options: ModuleOptions = {})`

Marks a class as a module (container)

#### `Provider(mode?: ProviderMode)`

Marks a class as a provider

#### `Inject(token?: Token)`

Injects a provider into a property or constructor parameter

## Options

#### `ModuleOptions`

Options for the container.

```typescript
interface ContainerOptions {
  isGlobal?: boolean;
  imports?: Class[];
  providers?: Array<Class | Provider>;
  exports?: Token[];
}
```

## Other packages

- [@injets/functional](https://npmjs.com/package/@injets/functional) - Support for functional programming in JavaScript and TypeScript.
- [@injets/core](https://npmjs.com/package/@injets/core) - A lightweight dependency injection library for Node.js and TypeScript.
