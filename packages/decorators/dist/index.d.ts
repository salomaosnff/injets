import 'reflect-metadata';
import { Class, Container, DependencyValues, Provider as ProviderOptions, ProviderMode, Token } from '@injets/core';
export { delayed, Token, Container, } from '@injets/core';
export interface ModuleOptions {
    imports?: Class<any>[];
    providers?: Array<Class<unknown> | ProviderOptions>;
    exports?: Class<unknown>[];
    global?: boolean;
}
export interface MountedModule {
    container: Container;
    resolve<const T extends Token[]>(...tokens: T): DependencyValues<T>;
}
export declare function Module(options?: ModuleOptions): (target: Class<unknown>) => void;
export declare function Provider(mode?: ProviderMode): ClassDecorator;
export declare function Inject(token?: Token): any;
export declare function mount<T extends Class<unknown>>(target: T): MountedModule;
