# @injets/functional

*Read this in other languages: [English](README.md) | [Português](README.pt-BR.md)*

A lightweight and purely functional dependency injection (DI) library for JavaScript and TypeScript.

Instead of relying on complex classes and decorators (like `@Injectable`), `@injets/functional` leverages the power of closures and functions to create a simple dependency injection system with strong typing (TypeScript) and native, safe support for resolving circular dependencies.

## Installation

```bash
npm install @injets/functional
# or using pnpm
pnpm add @injets/functional
```

## Basic Concepts

### 1. Tokens (`defineToken`)
Tokens are unique, typed identifiers used to register and reference dependencies. They ensure perfectly typed injection.

### 2. Containers (`defineContainer`)
A container groups your dependencies. The `defineContainer` function takes a name and an initialization function (where the providers will be registered). It returns a "resolver" function (often named with the prefix `use`, e.g., `useApp`).

### 3. Dependency Registration (`singleton`, `transient`, `constant`)
Inside the container function, you register how each token should be built or resolved.

## Usage Example

```typescript
import {
  defineContainer,
  defineToken,
  singleton,
  transient,
  constant
} from '@injets/functional';

// 1. Define your tokens with the expected types
const API_URL = defineToken<string>('API_URL');
const USER_REPO = defineToken<UserRepository>('USER_REPO');
const USER_SERVICE = defineToken<UserService>('USER_SERVICE');

// Example interfaces
interface UserRepository {
  getUsers(): string[];
}
interface UserService {
  printUsers(): void;
}

// 2. Define your container
const useApp = defineContainer('AppContainer', () => {
  // Constant: Static value directly injected
  constant(API_URL, 'https://api.example.com');

  // Singleton: Instantiated ONLY ONCE and cached
  singleton(USER_REPO, () => {
    const url = useApp(API_URL);
    return {
      getUsers: () => ['Alice', 'Bob', `fetched from ${url}`]
    };
  });

  // Transient: A new instance is created EVERY TIME it is resolved
  transient(USER_SERVICE, () => {
    const repo = useApp(USER_REPO);
    return {
      printUsers: () => console.log(repo.getUsers())
    };
  });
});

// 3. Resolve dependencies
const userService = useApp(USER_SERVICE);
userService.printUsers();

// You can also resolve multiple tokens at once
const [url, repo] = useApp([API_URL, USER_REPO]);
```

## Handling Circular Dependencies (`lazy`)

When a dependency `A` requires `B`, and `B` requires `A`, a cycle occurs that would normally crash or cause a stack overflow. `@injets/functional` features **advanced cycle protection**, displaying the exact trace of the error.

To resolve intentional circular dependencies, use the `lazy` utility. It allows delaying token evaluation by returning a *Proxy*. The real dependency is only instantiated when one of its properties is actually accessed for the first time.

```typescript
import { defineContainer, defineToken, singleton, lazy } from '@injets/functional';

const A = defineToken<{ hello(): void }>('A');
const B = defineToken<{ world(): void }>('B');

const useApp = defineContainer('App', () => {
  singleton(A, () => {
    // Wrapping the call with lazy() prevents immediate resolution, breaking the cycle
    const b = useApp(lazy(() => B));
    return {
      hello() {
        console.log('Hello');
        b.world(); // `B` is effectively instantiated/accessed only here
      }
    }
  });

  singleton(B, () => {
    const a = useApp(lazy(() => A));
    return {
      world() {
        console.log('World!');
      }
    }
  });
});

const a = useApp(A);
a.hello(); // Prints: Hello \n World!
```

## API Reference

### `defineToken<T>(name: string): Token<T>`
Creates and returns a new identifier (Symbol) used as an injection reference. The `<T>` generic defines the return type when using the *resolver*.

### `defineContainer(name: string, factory: () => void): ContainerResolver`
Creates a new injection scope. 
* Inside the `factory` callback, you must make calls to `singleton`, `transient`, and `constant`.
* Returns a `resolver` function. When invoking `resolver(TOKEN)`, it will fetch the provider from that scope.
* You can pass an _array_ of tokens: `resolver([TOKEN1, TOKEN2])` which will return the corresponding values in a typed tuple.
* Exposes asynchronous methods via `resolver.asyncResolve(...)` if any provider returns a `Promise`.

### `constant<T>(token: Token<T>, value: T)`
Binds a `Token` to a static and immutable `value`.

### `transient<T>(token: Token<T>, factory: Provider<T>)`
Binds a `Token` to a generator function (factory). The container will invoke the `factory` and create a new value **every time** this token is requested.

### `singleton<T>(token: Token<T>, factory: Provider<T>)`
Binds a `Token` to a generator function. The container will invoke the `factory` **only once**. Any subsequent calls will return the value previously saved in the container's internal cache.

### `lazy<T>(tokenGetter: () => Token<T>): Token<T>`
Creates a proxy that delays the actual resolution of the dependency until the first moment the properties of the resulting object need to be queried or one of its methods is invoked. Indispensable in designs that have bidirectional cycles (e.g., Models referencing each other).

## Common Errors

### `Cyclic Dependency Error`
If two dependencies try to instantiate each other simultaneously without using `lazy` (e.g., `A -> B -> A`), the library will intercept the chain at runtime and throw a descriptive error visually demonstrating the cycle to facilitate debugging.
**Solution:** Identify the cycle and use the `lazy(() => Token)` wrapper when resolving one of the ends.

### `Provider "..." not found in container "..."`
Occurs when using a container's _resolver_ trying to access a Token that was never provided (missing `singleton`/`transient`/`constant` for it in the container declaration).

### `No active container! Registration functions ... can only be called within ...`
Occurs if you try to invoke `singleton`, `transient`, or `constant` functions outside the scope of the *factory* function received by `defineContainer`. Injection works by implicitly connecting the provider to the scope where it is being declared.
