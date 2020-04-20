import { ProviderOptions, Constructor } from "./types";
import { ModuleRef } from "./module";
export declare class ProviderRef<T = any> {
    private module;
    private instance;
    private options;
    constructor(optionsOrConstructor: ProviderOptions | Constructor, module: ModuleRef);
    static create<T extends any>(optionsOrConstructor: ProviderOptions | Constructor, moduleRef: ModuleRef): Promise<T>;
    factory(): Promise<T>;
    get(): Promise<T>;
}
