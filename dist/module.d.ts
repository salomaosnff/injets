import { Constructor, DynamicModule } from "./types";
import { ProviderRef } from "./provider";
export declare const MODULE_REF: unique symbol;
export declare const ROOT_MODULE_REF: unique symbol;
export declare class ModuleRef<T = any> {
    name: string;
    instance: T;
    readonly isGlobal: boolean;
    readonly providers: Map<any, ProviderRef<any>>;
    readonly exports: Map<any, ProviderRef<any>>;
    readonly importedProviders: Map<any, ProviderRef<any>>;
    readonly modules: Map<Constructor<any>, ModuleRef<any>>;
    readonly globals: Set<ModuleRef<any>>;
    readonly root: ModuleRef;
    constructor(name: string, instance: T, root?: ModuleRef, isGlobal?: boolean);
    private getGlobal;
    get<T>(token: Constructor<T> | any, required?: true): Promise<T>;
    get<T>(token: Constructor<T> | any, required: false): Promise<T | undefined>;
    getModule<T = any>(module: Constructor<T>): ModuleRef<T>;
    static create(module: DynamicModule, root?: ModuleRef): Promise<ModuleRef>;
    static create<T extends Constructor>(module: T, root?: ModuleRef): Promise<ModuleRef<T>>;
}
