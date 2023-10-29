import type { ClassProvider,
  DependencyList,
  FactoryProvider,
  Provider,
  ProviderMode,
  Token,
  ValueProvider } from './types';

/** Get the name of a token. */
export function tokenName(token: Token) {
  if (typeof token === 'function') {
    return token.name;
  }

  return String(token);
}

/** Check if a provider is a value provider. */
export function isValueProvider(provider: Provider): provider is ValueProvider {
  return 'useValue' in provider;
}

/** Check if a provider is a class provider. */
export function isClassProvider<T, D extends DependencyList>(
  provider: Provider<T, D>,
): provider is ClassProvider<T, D> {
  return 'useClass' in provider;
}

/** Check if a provider is a factory provider. */
export function isFactoryProvider<T, D extends DependencyList>(
  provider: Provider<T, D>,
): provider is FactoryProvider<T, D> {
  return 'useFactory' in provider;
}

/** Check if a provider is a class or factory provider. */
export function providerModeIs<M extends ProviderMode>(
  provider: { mode?: ProviderMode },
  mode: M,
): provider is Provider & {
  mode: M
} {
  return provider.mode === mode;
}
