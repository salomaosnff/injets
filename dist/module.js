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
import { ProviderNotFoundError } from "./errors/module.errors";
export const CURRENT_MODULE = Symbol("CURRENT_MODULE");
export const ROOT_MODULE = Symbol("ROOT_MODULE");
export class ModuleRef {
    constructor(name, instance, root, isGlobal = false) {
        this.name = name;
        this.instance = instance;
        this.isGlobal = isGlobal;
        this.providers = new Map();
        this.exports = new Set();
        this.importedProviders = new Map();
        this.modules = new Map();
        this.globalProviders = new Map();
        this.root = root || this;
    }
    get(token, required = true) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hasProvider(token)) {
                return (_a = this.getProvider(token)) === null || _a === void 0 ? void 0 : _a.get();
            }
            if (required) {
                throw new ProviderNotFoundError(token, this.name);
            }
        });
    }
    getProvider(token) {
        const { providers, importedProviders, root } = this;
        if (providers.has(token)) {
            return providers.get(token);
        }
        if (importedProviders.has(token)) {
            return importedProviders.get(token);
        }
        return root.globalProviders.get(token);
    }
    hasProvider(token) {
        return (this.providers.has(token) ||
            this.importedProviders.has(token) ||
            this.root.globalProviders.has(token));
    }
    getModule(module) {
        const ref = this.modules.get(module);
        if (ref)
            return ref;
        throw new Error(`Module ${module.name} not found in ${this.name}!`);
    }
    static create(module, root) {
        var _a;
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
            const providers = new Set((options.providers || []).sort((a, b) => {
                const depsA = typeof a === "function"
                    ? Reflect.getMetadata(PROVIDER_DEPENDENCIES, a) || []
                    : [];
                const tokenB = typeof b === "function" ? b : b.provide;
                return depsA.includes(tokenB) ? -1 : 0;
            }));
            const ref = new ModuleRef(ModuleConstructor.name, new ModuleConstructor(), root, options.global);
            (_a = options.exports) === null || _a === void 0 ? void 0 : _a.forEach((exported) => {
                ref.exports.add(exported);
            });
            root = root || ref;
            // Current module as provider
            ref.providers.set(CURRENT_MODULE, new ProviderRef({ useValue: ref, provide: CURRENT_MODULE }, ref));
            // Root module as provider
            ref.providers.set(ROOT_MODULE, new ProviderRef({ useValue: root, provide: CURRENT_MODULE }, ref));
            // Init Submodules
            for (const submodule of imports) {
                const submoduleInstance = yield this.create(submodule, root);
                submoduleInstance.exports.forEach((token) => {
                    const provider = submoduleInstance.getProvider(token);
                    ref.importedProviders.set(token, provider);
                });
                ref.modules.set(submodule, submoduleInstance);
            }
            // Init Providers
            for (const provider of providers) {
                const token = typeof provider === "function" ? provider : provider.provide;
                ref.providers.set(token, new ProviderRef(provider, ref));
            }
            // Globals
            if (ref.isGlobal) {
                for (const token of ref.exports) {
                    ref.root.globalProviders.set(token, ref.providers.get(token));
                }
            }
            const moduleDeps = Reflect.getMetadata(PROVIDER_DEPENDENCIES, ModuleConstructor) || [];
            ProviderRef.checkIfHasAllConstructorParams(ModuleConstructor, ref);
            for (const dep of moduleDeps) {
                if (dep.key) {
                    ref.instance[dep.key] = yield ref.get(dep.token, dep.required);
                }
            }
            // On Module Init
            if (ref.instance.onModuleInit) {
                ref.instance.onModuleInit();
            }
            return ref;
        });
    }
}
//# sourceMappingURL=module.js.map