import { Constructor, DynamicModule } from "./types";
import { ProviderRef } from "./provider";
export declare const MODULE_REF: unique symbol;
export declare const ROOT_MODULE_REF: unique symbol;
export declare class ModuleRef<T = any> {
    name: string;
    instance: T;
    readonly providers: Map<any, ProviderRef<any>>;
    readonly exports: Map<any, ProviderRef<any>>;
    readonly importedProviders: Map<any, ProviderRef<any>>;
    readonly modules: Map<Constructor<any>, ModuleRef<any>>;
    constructor(name: string, instance: T);
    get<T>(provider: Constructor<T>): Promise<T>;
    get<T = any>(token: any): Promise<T>;
    getModule<T = any>(module: Constructor<T>): ModuleRef<T>;
    static create(module: DynamicModule, root?: ModuleRef): Promise<ModuleRef>;
    static create<T extends Constructor>(module: T, root?: ModuleRef): Promise<ModuleRef<T>>;
}
