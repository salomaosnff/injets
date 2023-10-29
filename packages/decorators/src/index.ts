import 'reflect-metadata';
import { Class, Container, DependencyValues, Provider as ProviderOptions, ProviderMode, Token, tokenName } from '@injets/core';

export {
  delayed, Token, Container,
} from '@injets/core';

const $MOUNTED = Symbol('mounted');
const $PROVIDER = Symbol('provider');
const $INJECTS = Symbol('provider.injects.params');
const $OPTIONS = Symbol('options');

interface InjectProperty {
  key?: string | symbol;
  token: Token;
  index?: number;
}

export interface ModuleOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imports?: Class<any>[];
  providers?: Array<Class<unknown> | ProviderOptions>;
  exports?: Class<unknown>[];
  global?: boolean;
}

export interface MountedModule {
  container: Container;

  resolve<const T extends Token[]>(...tokens: T): DependencyValues<T>;
}

export function Module(options: ModuleOptions = {}) {
  return (target: Class<unknown>) => {
    Reflect.defineProperty(target, $OPTIONS, { value: options });

    if (options.global) {
      Container.global.import(mount(target).container);
    }
  };
}

export function Provider(
  mode = ProviderMode.SINGLETON,
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any) => {
    const options: ProviderOptions = {
      token: target,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...deps: any[]) => {
        const injects = Reflect.get(target, $INJECTS) as InjectProperty[] ?? [];
        const {
          properties, params,
        } = deps.reduce((acc, dep, index) => {          
          const item = injects[index];

          if (!item) {
            return acc;
          }

          if (item.key !== undefined) {
            acc.properties[item.key] = dep;
          }

          if (item.index !== undefined) {
            acc.params.push(dep);
          }

          return acc;
        }, {
          properties: {} as Record<string, unknown>,
          params: [] as unknown[],
        });

        return Object.assign(new target(...params), properties);
      },
      mode,
      inject: ((Reflect.get(target, $INJECTS) ?? []) as InjectProperty[]).map(({ token }) => token),
    };

    Reflect.defineProperty(target, $PROVIDER, { value: options });
  };
}

export function Inject(token?: Token): any {
  return (target: object, key: string | symbol, index: number) => {
    token ??= index !== undefined ? Reflect.getMetadata('design:paramtypes', target)[index] : Reflect.getMetadata('design:type', target, key!);

    if (!token) {
      throw new Error(`Missing token for ${tokenName(target.constructor)}#${String(key)}`);
    }

    const item: InjectProperty = { token };

    const injects = Reflect.get(target, $INJECTS) as InjectProperty[] ?? [];
    
    injects.push(item);

    if (index !== undefined) {
      item.index = index;
      Reflect.set(target, $INJECTS, injects);
    }

    if (key !== undefined) {
      item.key = key;
      Reflect.set(target.constructor, $INJECTS, injects);
    }
  };
}

export function mount<T extends Class<unknown>>(target: T): MountedModule {
  if ($MOUNTED in target) {
    return Reflect.get(target, $MOUNTED) as MountedModule;
  }

  if (!($OPTIONS in target)) {
    throw new Error(`Missing @Module decorator on ${target.name}`);
  }

  const options = target[$OPTIONS] as ModuleOptions;

  const container = new Container({
    name: target.name,
    defaultExport: false,
    providers: (options.providers ?? []).map((provider) => {
      const options = Reflect.get(provider, $PROVIDER) as ProviderOptions;

      if (!options) {
        throw new Error(`Missing @Provider decorator on ${target.name}`);
      }

      return options;
    }),
    imports: (options.imports ?? []).map((imported) => mount(imported).container),
  });

  for (const exported of options.exports ?? []) {
    container.export(exported);
  }

  Reflect.defineProperty(target, $MOUNTED, {
    value: {
      container,
      resolve: <const T extends Token[]>(tokens: T, includePrivate = true) => container.resolve(tokens, includePrivate),
    },
  });

  return Reflect.get(target, $MOUNTED) as MountedModule;
}
