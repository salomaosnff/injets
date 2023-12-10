'use strict';

const core = require('@injets/core');

let currentContainer = null;
function getParentContainer() {
  if (!currentContainer) {
    throw new Error("No container is currently active.");
  }
  return currentContainer;
}
function runInContainer(container, cb) {
  const lastContainer = currentContainer;
  currentContainer = container;
  const result = cb();
  currentContainer = lastContainer;
  return result;
}
function bindToContainer(fn) {
  return (...args) => runInContainer(getParentContainer(), () => fn(...args));
}
function inject(token) {
  return getParentContainer().resolve(token);
}
function depends(...containersOrResolvers) {
  const currentContainer2 = getParentContainer();
  for (const resolver of containersOrResolvers) {
    if (resolver instanceof core.Container) {
      currentContainer2.import(resolver);
      continue;
    }
    if (typeof resolver === "function" && resolver.container instanceof core.Container) {
      currentContainer2.import(resolver.container);
      continue;
    }
    throw new TypeError("Invalid container or resolver.");
  }
}
function provide(provider) {
  getParentContainer().provide(provider);
}
function singleton(token, factory, exportProvider = true) {
  getParentContainer().provide({
    token,
    mode: core.ProviderMode.SINGLETON,
    useFactory: bindToContainer(factory),
    export: exportProvider
  });
}
function constant(token, value, exportProvider = true) {
  getParentContainer().provide({
    token,
    useValue: value,
    export: exportProvider
  });
}
function transient(token, factory, exportProvider = true) {
  getParentContainer().provide({
    token,
    useFactory: bindToContainer(factory),
    mode: core.ProviderMode.TRANSIENT,
    export: exportProvider
  });
}
function global() {
  const container = getParentContainer();
  if (container.isGlobal) {
    return;
  }
  container.isGlobal = true;
  core.Container.global.import(container);
}
function createResolverFactoryContext(container) {
  return {
    inject,
    global,
    depends,
    provide,
    singleton,
    constant,
    transient,
    container
  };
}
function createResolverForContainer(container) {
  const resolve = (...tokens) => runInContainer(container, () => container.resolve(tokens));
  resolve.container = container;
  return resolve;
}
function createResolver(name, factory) {
  return runInContainer(new core.Container({ name }), () => {
    const container = getParentContainer();
    factory(createResolverFactoryContext(container));
    return createResolverForContainer(container);
  });
}

exports.bindToContainer = bindToContainer;
exports.constant = constant;
exports.createResolver = createResolver;
exports.createResolverForContainer = createResolverForContainer;
exports.depends = depends;
exports.getParentContainer = getParentContainer;
exports.global = global;
exports.inject = inject;
exports.provide = provide;
exports.runInContainer = runInContainer;
exports.singleton = singleton;
exports.transient = transient;
