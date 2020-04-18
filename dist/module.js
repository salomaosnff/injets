var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProviderRef } from "./provider";
import { MODULE_OPTIONS } from "./meta/module.meta";
import { PROVIDER_DEPENDENCIES } from "./meta/provider.meta";
export const MODULE_REF = Symbol("current_module");
export const ROOT_MODULE_REF = Symbol("root_module");
export class ModuleRef {
    constructor(name, instance, root, isGlobal = false) {
        this.name = name;
        this.instance = instance;
        this.isGlobal = isGlobal;
        this.providers = new Map();
        this.exports = new Map();
        this.importedProviders = new Map();
        this.modules = new Map();
        this.globals = new Set();
        this.root = root || this;
    }
    getGlobal(token) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const module of this.root.globals.values()) {
                if (module.providers.has(token)) {
                    return module.providers.get(token);
                }
            }
        });
    }
    get(token, required = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = this.providers.has(token)
                ? this.providers.get(token)
                : this.importedProviders.has(token)
                    ? this.importedProviders.get(token)
                    : yield this.getGlobal(token);
            if (typeof provider !== 'undefined')
                return provider.get();
            if (required) {
                throw new Error(`Provider ${token} not found in ${this.name} module context!`);
            }
        });
    }
    getModule(module) {
        const ref = this.modules.get(module);
        if (ref)
            return ref;
        throw new Error(`Module ${module.name} not found in ${this.name}!`);
    }
    static create(module, root) {
        return __awaiter(this, void 0, void 0, function* () {
            let options;
            let ModuleConstructor;
            if (typeof module === "function") {
                options = Reflect.getMetadata(MODULE_OPTIONS, module);
                ModuleConstructor = module;
            }
            else {
                options = module;
                ModuleConstructor = module.module;
            }
            const imports = new Set(options.imports || []);
            const exportedProviders = new Set(options.exports || []);
            const providers = new Set((options.providers || []).sort((a, b) => {
                const depsA = typeof a === "function"
                    ? Reflect.getMetadata(PROVIDER_DEPENDENCIES, a) || []
                    : [];
                const tokenB = typeof b === "function" ? b : b.provide;
                return depsA.includes(tokenB) ? -1 : 0;
            }));
            const ref = new ModuleRef(ModuleConstructor.name, new ModuleConstructor(), root, options.global);
            root = root || ref;
            // Init Submodules
            for (const submodule of imports) {
                const submoduleInstance = yield this.create(submodule, ref);
                submoduleInstance.exports.forEach((provider, token) => {
                    ref.importedProviders.set(token, provider);
                });
                ref.modules.set(submodule, submoduleInstance);
            }
            // Init Providers
            for (const provider of providers) {
                const token = typeof provider === "function" ? provider : provider.provide;
                ref.providers.set(token, new ProviderRef(provider, ref));
            }
            ref.providers.set(ROOT_MODULE_REF, new ProviderRef({ useValue: root }, ref));
            // Exports
            for (const provider of exportedProviders) {
                if (!ref.providers.has(provider)) {
                    throw new Error(`${provider} not exists!`);
                }
                ref.exports.set(provider, ref.providers.get(provider));
            }
            const moduleDeps = Reflect.getMetadata(PROVIDER_DEPENDENCIES, ModuleConstructor) || [];
            for (let dep of moduleDeps) {
                if (dep.key) {
                    ref.instance[dep.key] = yield ref.get(dep.token, dep.required);
                }
            }
            if (ref.isGlobal) {
                root.globals.add(ref);
            }
            if (ref.instance.onModuleInit) {
                ref.instance.onModuleInit();
            }
            return ref;
        });
    }
}
//# sourceMappingURL=module.js.map