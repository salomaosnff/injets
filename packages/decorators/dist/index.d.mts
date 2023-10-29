import { Class, Provider as Provider$1, Container, Token, DependencyValues, ProviderMode } from '@injets/core';
export { Container, Token, delayed } from '@injets/core';

interface ModuleOptions {
    imports?: Class<any>[];
    providers?: Array<Class<unknown> | Provider$1>;
    exports?: Class<unknown>[];
    global?: boolean;
}
interface MountedModule {
    container: Container;
    resolve<const T extends Token[]>(...tokens: T): DependencyValues<T>;
}
declare function Module(options?: ModuleOptions): (target: Class<unknown>) => void;
declare function Provider(mode?: ProviderMode): ClassDecorator;
declare function Inject(token?: Token): any;
declare function mount<T extends Class<unknown>>(target: T): MountedModule;

export { Inject, Module, ModuleOptions, MountedModule, Provider, mount };
