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
    static checkIfHasAllConstructorParams(ProviderConstructor, params) {
        const paramConstructorToParamInstance = new WeakMap();
        for (const param of params) {
            (param === null || param === void 0 ? void 0 : param.constructor) && paramConstructorToParamInstance.set(param.constructor, param);
        }
        const constructorParams = Reflect.getMetadata('design:paramtypes', ProviderConstructor);
        if (!constructorParams) {
            return;
        }
        for (const param of constructorParams) {
            if (typeof param === 'function' && !paramConstructorToParamInstance.get(param)) {
                throw new ProviderNotImportedError(ProviderConstructor, param);
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
                this.checkIfHasAllConstructorParams(ProviderConstructor, deps.params);
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