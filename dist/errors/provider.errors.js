export class ProviderNotImportedError extends Error {
    constructor(providerRunning, providerNotInjected) {
        super(`Error while trying to inject provider "${providerNotInjected.name}" in provider "${providerRunning.name}": provider "${providerNotInjected.name}" type was not imported.`);
    }
}
//# sourceMappingURL=provider.errors.js.map