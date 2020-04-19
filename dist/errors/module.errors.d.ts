import { Constructor } from "../types";
export declare class ProviderNotFoundError extends Error {
    constructor(provider: Constructor | any, moduleName: string);
}
