export class ProviderNotFoundError extends Error {
    constructor(provider, moduleName) {
        super(`Provider ${provider} not found in ${moduleName} module context`);
    }
}
//# sourceMappingURL=module.errors.js.map