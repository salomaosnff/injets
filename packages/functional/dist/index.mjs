import { Container, ProviderMode } from '@injets/core';

function createResolverFactoryContext(name) {
  const currentContainer = new Container({ name });
  function depends(...containersOrResolvers) {
    for (const resolver of containersOrResolvers) {
      if (resolver instanceof Container) {
        currentContainer.import(resolver);
        continue;
      }
      if (typeof resolver === "function" && resolver.container instanceof Container) {
        currentContainer.import(resolver.container);
        continue;
      }
      throw new TypeError("Invalid container or resolver.");
    }
  }
  function provide(provider) {
    currentContainer.provide(provider);
  }
  function singleton(token, factory, exportProvider = true) {
    currentContainer.provide({
      token,
      mode: ProviderMode.SINGLETON,
      useFactory: factory,
      export: exportProvider
    });
  }
  function constant(token, value, exportProvider = true) {
    currentContainer.provide({
      token,
      useValue: value,
      export: exportProvider
    });
  }
  function transient(token, factory, exportProvider = true) {
    currentContainer.provide({
      token,
      useFactory: factory,
      mode: ProviderMode.TRANSIENT,
      export: exportProvider
    });
  }
  function inject(token) {
    return currentContainer.resolve(token);
  }
  function global() {
    if (currentContainer.isGlobal) {
      return;
    }
    currentContainer.isGlobal = true;
    Container.global.import(currentContainer);
  }
  return {
    inject,
    global,
    depends,
    provide,
    singleton,
    constant,
    transient,
    container: currentContainer
  };
}
function createResolverForContainer(container) {
  const resolve = (...tokens) => container.resolve(tokens);
  resolve.container = container;
  return resolve;
}
function createResolver(name, factory) {
  const context = createResolverFactoryContext(name);
  factory(context);
  return createResolverForContainer(context.container);
}

export { createResolver, createResolverForContainer };
