import { Constructor, DynamicModule } from "./types";
import { ProviderRef } from "./provider";
export declare const CURRENT_MODULE: unique symbol;
export declare const ROOT_MODULE: unique symbol;
export declare class ModuleRef<T = any> {
    name: string;
    instance: T;
    readonly isGlobal: boolean;
    readonly providers: Map<any, ProviderRef<any>>;
    readonly exports: Set<any>;
    readonly importedProviders: Map<any, ProviderRef<any>>;
    readonly modules: Map<Constructor<any>, ModuleRef<any>>;
    readonly globalProviders: Map<any, ProviderRef<any>>;
    readonly root: ModuleRef;
    constructor(name: string, instance: T, root?: ModuleRef, isGlobal?: boolean);
    get<T>(token: any, required?: boolean): Promise<T | undefined>;
    getProvider(token: any): ProviderRef<any> | undefined;
    hasProvider(token: any): boolean;
    getModule<T = any>(module: Constructor<T>): ModuleRef<T>;
    static create(module: DynamicModule, root?: ModuleRef): Promise<ModuleRef>;
    static create<T extends Constructor>(module: T, root?: ModuleRef): Promise<ModuleRef<T>>;
}
