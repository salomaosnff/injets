import { ProviderRef } from "../provider";
export class ProviderNotFoundError extends Error {
    constructor(provider, moduleName) {
        super(`${ProviderRef.getName(provider)} not found in ${moduleName} module context`);
    }
}
//# sourceMappingURL=module.errors.js.map