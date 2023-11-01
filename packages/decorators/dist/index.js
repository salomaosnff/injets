import 'reflect-metadata';
import { Container, ProviderMode, tokenName } from '@injets/core';
export { delayed, Container, } from '@injets/core';
const $MOUNTED = Symbol('mounted');
const $PROVIDER = Symbol('provider');
const $INJECTS = Symbol('provider.injects.params');
const $OPTIONS = Symbol('options');
export function Module(options = {}) {
    return (target) => {
        Reflect.defineProperty(target, $OPTIONS, { value: options });
        if (options.global) {
            Container.global.import(mount(target).container);
        }
    };
}
export function Provider(mode = ProviderMode.SINGLETON) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target) => {
        const options = {
            token: target,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            useFactory: (...deps) => {
                const injects = Reflect.get(target, $INJECTS) ?? [];
                const { properties, params, } = deps.reduce((acc, dep, index) => {
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
                    properties: {},
                    params: [],
                });
                return Object.assign(new target(...params), properties);
            },
            mode,
            inject: (Reflect.get(target, $INJECTS) ?? []).map(({ token }) => token),
        };
        Reflect.defineProperty(target, $PROVIDER, { value: options });
    };
}
export function Inject(token) {
    return (target, key, index) => {
        token ??= index !== undefined ? Reflect.getMetadata('design:paramtypes', target)[index] : Reflect.getMetadata('design:type', target, key);
        if (!token) {
            throw new Error(`Missing token for ${tokenName(target.constructor)}#${String(key)}`);
        }
        const item = { token };
        const injects = Reflect.get(target, $INJECTS) ?? [];
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
export function mount(target) {
    if ($MOUNTED in target) {
        return Reflect.get(target, $MOUNTED);
    }
    if (!($OPTIONS in target)) {
        throw new Error(`Missing @Module decorator on ${target.name}`);
    }
    const options = target[$OPTIONS];
    const container = new Container({
        name: target.name,
        defaultExport: false,
        providers: (options.providers ?? []).map((provider) => {
            const options = Reflect.get(provider, $PROVIDER);
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
            resolve: (tokens, includePrivate = true) => container.resolve(tokens, includePrivate),
        },
    });
    return Reflect.get(target, $MOUNTED);
}
