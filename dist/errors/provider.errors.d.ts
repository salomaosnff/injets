import { Constructor } from "../types";
export declare class ProviderNotImportedError extends Error {
    constructor(providerRunning: Constructor, providerNotInjected: Constructor);
}
