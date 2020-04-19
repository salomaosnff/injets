[![npm version](https://badge.fury.io/js/injets.svg)](https://badge.fury.io/js/injets)

# Injets

**💉 Dependency Injection**: Organize your code in [modules](#modules) and inject [providers](#providers) in other modules.

**✏️ Annotations**:  Use annotations in your module classes to make your dependecy flow easier to understand.

**🏢 Singletons and Transient providers**: Create singletons just by specifying a single flag, and don't bother when you should instantiate your classes anymore.

Injets is a TypeScript Dependency Injection library inspired by [NestJS](https://nestjs.com/)
that uses reflect-metadata and annotations
to make your code more organized.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Documentation](#documentation)

## Installation

using [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

```bash
npm i injets
yarn add injets
```

## Getting started

To start using injets, you have to create a `root module`.

A `root module` is simply a starting point for your project, so all
other modules are going to be attached to it.

Here's how you can register a provider on the `root module`:

```typescript
// hello-world.provider.ts
import { Provider } from 'injets'

@Provider()
export class HelloWorldProvider {
  hello () {
    console.log('Hello World!')
  }
}

// app.module.ts
import { Module } from 'injets';
import { HelloProvider } from './hello-world.provider.ts'

@Module({
    providers: [HelloProvider]
})
export class AppModule {}
```

To get your app up and running you first have to instantiate the `root module`.
To do so, there's a static helper called `ModuleRef.create`.
This is your entry point:

```typescript
// index.js
import { ModuleRef } from 'injets'
import { AppModule } from './app.module.ts'

async function main() {
    const app = await ModuleRef.create(AppModule)
    const helloProvider = await app.get(HelloProvider)

    // -> Hello World
    helloProvider.hello()
}

main()
```

Providers are entities that are responsible for executing the logic of your application.
You often have to access logic from other parts of your app.

To access another `Provider`, you can simply declare its type
on the current `Provider` constructor:

```typescript
// app.module.ts
import { Module } from 'injets';
import { LogProvider } from './log.provider.ts'
import { HttpProvider } from './http.provider.ts'

@Module({
    providers: [HelloProvider, HttpProvider]
})
export class AppModule {}

// http.provider.ts
import { Provider } from 'injets';
import { LogProvider } from './log.provider.ts'

@Provider()
export class HttpProvider {
    constructor(
        public logProvider: LogProvider
    ) {}

    async sendRequest(message: string) {
      try {
        await fetch('https://my-api.com')
        this.logProvider.success('Request was sent 🚀')
      } catch (error) {
        this.logProvider.error('Error while sending request ❌', error)
      }
    }
}
```

## Documentation

- [Modules](#modules)
  - [Structure of a module](#structure-of-a-module)
- [Providers](#providers)
  - [Structure of a provider](#structure-of-a-provider)

## Modules

Modules are a group of providers, your application must have at least one module (root module).

### Structure of a module

```typescript
@Module({
    // List of modules that will be imported into this module
    imports: [],
    // providers that will be registered in this module
    providers: [],
    // providers of this module that can be used in other modules where this module was imported
    exports: []
})
export class MyModule {
    // This method is called when the module and all its dependencies are initialized
    onModuleInit() {
        // Module Ready!
    }
}
```

## Providers

A provider can be anything you want to use anywhere in your application, but they are generally used to provide business logic methods for your application.

### Structure of a provider

```typescript
// A provider can have SINGLETON or TRANSIENT scope
@Provider(scope)
export class MyProvider {
    construtor (
        // You can import other providers here
        public usersProvider: UsersProvider
    ) {}

    method () {
        // You can call methods from imported providers like this
        this.usersProvider.method();
    }
}
```
