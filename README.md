# Injets

TypeScript Dependency Injection using reflect-metadata, typescript and ES7 feature.

## Installation

```bash
npm i injets
yarn add injets
```

## Getting started
To start using injets, you need to create at least one module.

```typescript
// app.module.ts
import { Module } from 'injets';

@Module({})
export class AppModule {}
```

Create your first provider

```typescript
// hello.provider.ts
import { Provider } from 'injets';

@Provider()
export class HelloProvider {
    hello() {
        return 'Hello World!'
    }
}
```

Register your provider in your module
```typescript
// app.module.ts
import { Module } from 'injets';
import { HelloProvider } from './hello.provider.ts'

@Module({
    providers: [HelloProvider]
})
export class AppModule {}
```

Instantiating the root module and calling providers

```typescript
// index.js
import { ModuleRef } from 'injets'
import { AppModule } from './app.module.ts'

async function main() {
    const app = await ModuleRef.create(AppModule)
    const helloProvider = await app.get<HelloProvider>(HelloProvider)
    
    console.log(helloProvider.hello())
}

main()
```

Injecting providers into other providers

```typescript
// provider1.provider.ts
import { Provider } from 'injets';

@Provider()
export class Provider1 {
    printMessage(message: string) {
        console.log('Provider 1 say:', message)
    }
}
```
```typescript
// provider2.provider.ts
import { Provider } from 'injets';
import { Provider1 } from './provider1.provider.ts'

@Provider()
export class Provider2 {
    constructor(
        public provider1: Provider1
    ) {}

    getMessage() {
        return 'Hello Provider 2!'
    }

    getMessageAndPrint(message: string) {
        this.provider1.printMessage(this.getMessage())
    }
}
```

```typescript
// app.module.ts
import { Module } from 'injets';
import { Provider1 } from './provider1.provider.ts'
import { Provider2 } from './provider2.provider.ts'

@Module({
    providers: [Provider1, Provider2]
})
export class AppModule {}
```

```typescript
// index.js
import { ModuleRef } from 'injets'
import { AppModule } from './app.module.ts'
import { Provider2 } from './provider2.provider.ts'

async function main() {
    const app = await ModuleRef.create(AppModule)
    const myProvider = await app.get<Provider2>(Provider2)
    
    myProvider.getMessageAndPrint()
}

main()
```

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