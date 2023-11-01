var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck$1 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$1 = (obj, member, getter) => {
  __accessCheck$1(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$1 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$1 = (obj, member, value, setter) => {
  __accessCheck$1(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _wrap;
const _Delayed = class _Delayed {
  constructor(factory) {
    __privateAdd$1(this, _wrap, void 0);
    __privateSet$1(this, _wrap, factory);
  }
  createProxy(factory) {
    let cache;
    const getValue = () => cache ?? (cache = factory(__privateGet$1(this, _wrap).call(this)));
    const handler = {};
    for (const method of _Delayed.reflectMethods) {
      handler[method] = (_, ...args) => (
        // eslint-disable-next-line @typescript-eslint/ban-types
        Reflect[method](getValue(), ...args)
      );
    }
    return new Proxy({}, handler);
  }
};
_wrap = new WeakMap();
__publicField$1(_Delayed, "reflectMethods", [
  "get",
  "getPrototypeOf",
  "setPrototypeOf",
  "getOwnPropertyDescriptor",
  "defineProperty",
  "has",
  "set",
  "deleteProperty",
  "apply",
  "construct",
  "ownKeys"
]);
let Delayed = _Delayed;
function delayed(factory) {
  return new Delayed(factory);
}

var ProviderMode = /* @__PURE__ */ ((ProviderMode2) => {
  ProviderMode2["SINGLETON"] = "SINGLETON";
  ProviderMode2["TRANSIENT"] = "TRANSIENT";
  return ProviderMode2;
})(ProviderMode || {});

function tokenName(token) {
  if (typeof token === "function") {
    return token.name;
  }
  return String(token);
}
function isValueProvider(provider) {
  return "useValue" in provider;
}
function isClassProvider(provider) {
  return "useClass" in provider;
}
function isFactoryProvider(provider) {
  return "useFactory" in provider;
}
function providerModeIs(provider, mode) {
  return provider.mode === mode;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _name, _export, _cache, _imported, _providers, _exported, _resolveProvider, resolveProvider_fn, _construct, construct_fn;
const _Container = class _Container {
  /**
   * Create a new dependency injection container.
   * @param options Container options.
   * @example
   * const container = new Container({
   *  name: 'MyContainer', // recommended
   *  imports: [OtherContainer],
   *  providers: [
   *   { token: Foo, useClass: Foo },
   *  ]
   * });
   * container.resolve(Foo); // Foo
   */
  constructor(options = {}) {
    __privateAdd(this, _resolveProvider);
    __privateAdd(this, _construct);
    __privateAdd(this, _name, void 0);
    __privateAdd(this, _export, void 0);
    __privateAdd(this, _cache, /* @__PURE__ */ new Map());
    __privateAdd(this, _imported, /* @__PURE__ */ new Map());
    __privateAdd(this, _providers, /* @__PURE__ */ new Map());
    __privateAdd(this, _exported, /* @__PURE__ */ new Set());
    __publicField(this, "isGlobal");
    this.isGlobal = options.isGlobal ?? false;
    __privateSet(this, _name, options.name ?? this.constructor.name);
    __privateSet(this, _export, options.defaultExport ?? true);
    for (const container of options.imports ?? []) {
      this.import(container);
    }
    for (const provider of options.providers ?? []) {
      this.provide(provider);
    }
  }
  resolve(tokenOrTokenList, includePrivate) {
    if (Array.isArray(tokenOrTokenList)) {
      return tokenOrTokenList.map((token2) => this.resolve(token2, includePrivate));
    }
    const token = tokenOrTokenList;
    if (typeof token === "undefined") {
      throw new TypeError(`Possible circular dependency detected in ${__privateGet(this, _name)} container.
Token is undefined.
Try to use "delay(() => <token>)" function to delay the resolution of the token.`);
    }
    if (token instanceof Delayed) {
      return token.createProxy((ctor) => this.resolve(ctor));
    }
    if (__privateGet(this, _cache).has(token)) {
      return __privateGet(this, _cache).get(token);
    }
    if (__privateGet(this, _providers).has(token)) {
      if (!includePrivate && !__privateGet(this, _exported).has(token)) {
        throw new Error(
          `Provider "${tokenName(token)}" is not exported from container "${__privateGet(this, _name)}"`
        );
      }
      const provider = __privateGet(this, _providers).get(token);
      return __privateMethod(this, _resolveProvider, resolveProvider_fn).call(this, provider);
    }
    if (__privateGet(this, _imported).has(token)) {
      const container = __privateGet(this, _imported).get(token);
      return container.resolve(token);
    }
    try {
      return _Container.global.resolve(token);
    } catch {
    }
    throw new Error(
      `Provider "${tokenName(token)}" not found in container "${__privateGet(this, _name)}"`
    );
  }
  /**
   * Provide a token in the container.
   * @param provider Provider to register.
   * @throws {Error} If the provider is invalid.
   * @example
   * container.provide({ token: Foo, useClass: Foo });
   * container.provide({ token: Bar, useValue: bar });
   * container.provide({ token: Baz, useFactory: () => baz });
   * container.provide({ token: Qux, useClass: Qux, inject: [Foo, Bar, Baz] });
   */
  provide(provider) {
    const token = provider.token ?? provider.useClass;
    if (isClassProvider(provider) || isFactoryProvider(provider)) {
      provider.mode ?? (provider.mode = ProviderMode.SINGLETON);
    }
    if (!token) {
      throw new Error("Provider must have a token or a useClass property");
    }
    __privateGet(this, _providers).set(token, provider);
    if (provider.export ?? __privateGet(this, _export)) {
      this.export(token);
    }
    if (this.isGlobal) {
      __privateGet(_Container.global, _imported).set(token, this);
    }
  }
  /**
   * Import all exported tokens from another container.
   * @param container Container to import from.
   * @example
   * container.import(otherContainer);
   * container.resolve(Foo); // Foo is exported from otherContainer
   */
  import(container) {
    for (const token of __privateGet(container, _exported)) {
      __privateGet(this, _imported).set(token, container);
    }
  }
  /**
   * Export a token from the container.
   * @param token Token to export.
   * @example
   * container.export(Foo);
   */
  export(token) {
    if (__privateGet(this, _providers).has(token)) {
      __privateGet(this, _exported).add(token);
      return;
    }
    throw new Error(
      `Cannot export "${tokenName(token)}" from container "${__privateGet(this, _name)}" because it is not registered`
    );
  }
};
_name = new WeakMap();
_export = new WeakMap();
_cache = new WeakMap();
_imported = new WeakMap();
_providers = new WeakMap();
_exported = new WeakMap();
_resolveProvider = new WeakSet();
resolveProvider_fn = function(provider) {
  const token = provider.token ?? provider.useClass;
  const instance = __privateMethod(this, _construct, construct_fn).call(this, provider);
  if (providerModeIs(provider, ProviderMode.SINGLETON)) {
    __privateGet(this, _cache).set(token, instance);
  }
  return instance;
};
_construct = new WeakSet();
construct_fn = function(provider) {
  if (isClassProvider(provider)) {
    const dependencies = this.resolve(provider.inject ?? [], true);
    return new provider.useClass(...dependencies);
  }
  if (isFactoryProvider(provider)) {
    const dependencies = this.resolve(provider.inject ?? [], true);
    return provider.useFactory(...dependencies);
  }
  if (isValueProvider(provider)) {
    return provider.useValue;
  }
  throw new Error("Providers must be a class, factory, or value");
};
__publicField(_Container, "global", new _Container({ name: "global" }));
let Container = _Container;

export { Container, Delayed, ProviderMode, delayed, isClassProvider, isFactoryProvider, isValueProvider, providerModeIs, tokenName };
