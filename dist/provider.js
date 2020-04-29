var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PROVIDER_SCOPE, PROVIDER_DEPENDENCIES } from './meta/provider.meta';
import { ProviderNotImportedError } from './errors/provider.errors';
export class ProviderRef {
    constructor(optionsOrConstructor, module) {
        this.module = module;
        this.options = {};
        if (typeof optionsOrConstructor === "function") {
            this.options = {
                useClass: optionsOrConstructor,
                provide: optionsOrConstructor,
                scope: Reflect.getMetadata(PROVIDER_SCOPE, optionsOrConstructor) ||
                    "SINGLETON",
            };
        }
        else {
            this.options = Object.assign({ scope: "SINGLETON" }, optionsOrConstructor);
        }
    }
    static getName(token) {
        if (typeof token === 'function') {
            return token.name;
        }
        return String(token);
    }
    static checkIfHasAllConstructorParams(ProviderConstructor, moduleRef) {
        const paramsNames = [];
        const providerDependencyList = Reflect.getMetadata(PROVIDER_DEPENDENCIES, ProviderConstructor) || [];
        const currentProviderName = this.getName(ProviderConstructor);
        for (const provider of providerDependencyList) {
            if (moduleRef.hasProvider(provider.token)) {
                paramsNames.push(this.getName(provider));
            }
            else if (provider.required) {
                paramsNames.push('?');
                throw new ProviderNotImportedError(currentProviderName, paramsNames, provider);
            }
            else {
                paramsNames.push('undefined');
            }
        }
    }
    static create(optionsOrConstructor, moduleRef) {
        return __awaiter(this, void 0, void 0, function* () {
            let ProviderConstructor;
            if (typeof optionsOrConstructor === "function") {
                ProviderConstructor = optionsOrConstructor;
            }
            else if (typeof optionsOrConstructor.useClass === "function") {
                ProviderConstructor = optionsOrConstructor.useClass;
            }
            else if (typeof optionsOrConstructor.useFactory === "function") {
                return optionsOrConstructor.useFactory();
            }
            if (ProviderConstructor) {
                this.checkIfHasAllConstructorParams(ProviderConstructor, moduleRef);
                const depsList = Reflect.getMetadata(PROVIDER_DEPENDENCIES, ProviderConstructor) || [];
                const deps = {
                    params: [],
                    props: {},
                };
                for (const item of depsList) {
                    if (typeof item.index === "number") {
                        deps.params[item.index] = yield moduleRef.get(item.token, item.required);
                    }
                    else if (item.key !== undefined) {
                        deps.props[item.key] = yield moduleRef.get(item.token, item.required);
                    }
                }
                const instance = new ProviderConstructor(...deps.params);
                return instance;
            }
            return optionsOrConstructor.useValue;
        });
    }
    factory() {
        if (typeof this.options.useFactory === "function") {
            return this.options.useFactory();
        }
        if (typeof this.options.useClass === "function") {
            return ProviderRef.create(this.options, this.module);
        }
        return this.options.useValue;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.options.scope === "SINGLETON") {
                if (this.instance)
                    return this.instance;
                return (this.instance = yield this.factory());
            }
            return this.factory();
        });
    }
}
//# sourceMappingURL=provider.js.map