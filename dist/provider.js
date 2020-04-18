var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PROVIDER_SCOPE } from './meta/provider.meta';
export class ProviderRef {
    constructor(optionsOrConstructor, module) {
        this.module = module;
        this.options = {};
        if (typeof optionsOrConstructor === 'function') {
            this.options = {
                useClass: optionsOrConstructor,
                provide: optionsOrConstructor,
                scope: Reflect.getMetadata(PROVIDER_SCOPE, optionsOrConstructor) ||
                    'SINGLETON'
            };
        }
        else {
            this.options = optionsOrConstructor;
        }
    }
    static create(optionsOrConstructor, moduleRef) {
        return __awaiter(this, void 0, void 0, function* () {
            let ProviderConstructor;
            if (typeof optionsOrConstructor === 'function') {
                ProviderConstructor = optionsOrConstructor;
            }
            else if (typeof optionsOrConstructor.useClass === 'function') {
                ProviderConstructor = optionsOrConstructor.useClass;
            }
            else if (typeof optionsOrConstructor.useFactory === 'function') {
                return optionsOrConstructor.useFactory();
            }
            if (ProviderConstructor) {
                const paramtypes = Reflect.getMetadata('design:paramtypes', ProviderConstructor) || [];
                const args = yield Promise.all(paramtypes.map((p) => moduleRef.get(p)));
                return new ProviderConstructor(...args);
            }
            return optionsOrConstructor.useValue;
        });
    }
    factory() {
        if (typeof this.options.useFactory === 'function') {
            return this.options.useFactory();
        }
        if (typeof this.options.useClass === 'function') {
            return ProviderRef.create(this.options, this.module);
        }
        return this.options.useValue;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.scope || this.options.scope === 'SINGLETON') {
                if (this.instance)
                    return this.instance;
                return (this.instance = yield this.factory());
            }
            return this.factory();
        });
    }
}
//# sourceMappingURL=provider.js.map