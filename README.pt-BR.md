# @injets/functional

*Read this in other languages: [English](README.md) | [Português](README.pt-BR.md)*

Uma biblioteca de injeção de dependências (DI) leve e puramente funcional para JavaScript e TypeScript.

Em vez de depender de classes e decoradores complexos (como `@Injectable`), o `@injets/functional` utiliza o poder das *closures* e funções para criar um sistema de injeção de dependências simples, com tipagem forte (TypeScript) e suporte nativo e seguro para resolução de dependências circulares.

## Instalação

```bash
npm install @injets/functional
# ou usando pnpm
pnpm add @injets/functional
```

## Conceitos Básicos

### 1. Tokens (`defineToken`)
Tokens são identificadores únicos e tipados usados para registrar e referenciar as dependências. Eles garantem que a injeção seja perfeitamente tipada.

### 2. Containers (`defineContainer`)
Um container agrupa suas dependências. A função `defineContainer` recebe um nome e uma função de inicialização (onde os provedores serão registrados). Ela retorna uma função "resolver" (frequentemente nomeada com o prefixo `use`, ex: `useApp`).

### 3. Registro de Dependências (`singleton`, `transient`, `constant`)
Dentro da função do container, você registra como cada token deve ser construído ou resolvido.

## Exemplo de Uso

```typescript
import {
  defineContainer,
  defineToken,
  singleton,
  transient,
  constant
} from '@injets/functional';

// 1. Defina seus tokens com os tipos esperados
const API_URL = defineToken<string>('API_URL');
const USER_REPO = defineToken<UserRepository>('USER_REPO');
const USER_SERVICE = defineToken<UserService>('USER_SERVICE');

// Interfaces de exemplo
interface UserRepository {
  getUsers(): string[];
}
interface UserService {
  printUsers(): void;
}

// 2. Defina seu container
const useApp = defineContainer('AppContainer', () => {
  // Constant: Valor estático injetado diretamente
  constant(API_URL, 'https://api.exemplo.com');

  // Singleton: Instanciado apenas UMA VEZ e armazenado em cache
  singleton(USER_REPO, () => {
    const url = useApp(API_URL);
    return {
      getUsers: () => ['Alice', 'Bob', `fetched from ${url}`]
    };
  });

  // Transient: Nova instância é criada TODA VEZ que for resolvida
  transient(USER_SERVICE, () => {
    const repo = useApp(USER_REPO);
    return {
      printUsers: () => console.log(repo.getUsers())
    };
  });
});

// 3. Resolva dependências
const userService = useApp(USER_SERVICE);
userService.printUsers();

// Você também pode resolver múltiplos tokens de uma vez
const [url, repo] = useApp([API_URL, USER_REPO]);
```

## Lidando com Dependências Circulares (`lazy`)

Quando uma dependência `A` requer `B`, e `B` requer `A`, ocorre um ciclo que em sistemas normais geraria travamento ou estouro de pilha. O `@injets/functional` possui **proteção avançada contra ciclos**, exibindo o rastreamento exato do erro.

Para resolver dependências circulares intencionais, use o utilitário `lazy`. Ele permite atrasar a avaliação do token devolvendo um *Proxy*. A dependência real só é instanciada quando uma de suas propriedades for efetivamente acessada pela primeira vez.

```typescript
import { defineContainer, defineToken, singleton, lazy } from '@injets/functional';

const A = defineToken<{ hello(): void }>('A');
const B = defineToken<{ world(): void }>('B');

const useApp = defineContainer('App', () => {
  singleton(A, () => {
    // Envolvendo a chamada com lazy() previne a resolução imediata, quebrando o ciclo
    const b = useApp(lazy(() => B));
    return {
      hello() {
        console.log('Hello');
        b.world(); // Só aqui `B` é de fato instanciado/acessado
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
a.hello(); // Imprime: Hello \n World!
```

## Referência da API

### `defineToken<T>(name: string): Token<T>`
Cria e retorna um novo identificador (Symbol) usado como referência da injeção. O genérico `<T>` define qual será o tipo de retorno no momento de utilizar o *resolver*.

### `defineContainer(name: string, factory: () => void): ContainerResolver`
Cria um novo escopo de injeção. 
* Dentro do callback `factory`, você obrigatoriamente fará as chamadas a `singleton`, `transient`, e `constant`.
* Retorna uma função `resolver`. Ao invocar `resolver(TOKEN)`, ela buscará o provedor daquele escopo.
* É possível passar um _array_ de tokens: `resolver([TOKEN1, TOKEN2])` que retornará os valores correspondentes em uma tupla tipada.
* Exibirá os métodos assíncronos via `resolver.asyncResolve(...)` caso algum provedor retorne `Promise`.

### `constant<T>(token: Token<T>, value: T)`
Atrela um `Token` a um `value` estático e imutável.

### `transient<T>(token: Token<T>, factory: Provider<T>)`
Atrela um `Token` a uma função geradora (factory). O container invocará o `factory` e criará um novo valor **cada vez** que esse token for requisitado.

### `singleton<T>(token: Token<T>, factory: Provider<T>)`
Atrela um `Token` a uma função geradora. O container invocará o `factory` **apenas uma vez**. Qualquer chamada subsequente retornará o valor previamente salvo no cache interno do container.

### `lazy<T>(tokenGetter: () => Token<T>): Token<T>`
Cria um proxy que retarda a resolução real da dependência até o primeiro momento em que as propriedades do objeto resultante precisarem ser consultadas ou um de seus métodos for evocado. Indispensável no design que possua ciclos bidirecionais (ex: Modelos que referenciam uns aos outros).

## Erros Comuns

### `Cyclic Dependency Error`
Se duas dependências tentam instanciar-se simultaneamente sem o uso do `lazy` (ex: `A -> B -> A`), a biblioteca interceptará a cadeia em tempo de execução e lançará um erro descritivo demonstrando visualmente o ciclo para facilitar a depuração.
**Solução:** Identifique o ciclo e use o wrapper `lazy(() => Token)` na resolução de uma das pontas.

### `Provider "..." not found in container "..."`
Acontece quando se usa o _resolver_ de um container tentando acessar um Token que nunca foi provido (ausência de `singleton`/`transient`/`constant` para ele na declaração do container).

### `No active container! Registration functions ... can only be called within ...`
Ocorre caso você tente invocar as funções `singleton`, `transient` ou `constant` fora do escopo da função *factory* recebida por `defineContainer`. A injeção funciona conectando implicitamente o provedor ao escopo onde ele está sendo declarado.
