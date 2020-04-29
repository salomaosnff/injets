import { ProviderRef } from "../provider";
export class ProviderNotImportedError extends Error {
    constructor(providerName, providerDeps, provider) {
        super(provider.key
            ? `Injets could not resolve dependencies of the ${providerName} provider in property "${provider.key}". Type ${ProviderRef.getName(provider.token)} could not be resolved.`
            : `Injets could not resolve dependencies of the ${providerName} provider (${providerDeps.join(', ')}). Please verify whether [${providerDeps.length - 1}] argument is available in the current module.`);
    }
}
//# sourceMappingURL=provider.errors.js.map