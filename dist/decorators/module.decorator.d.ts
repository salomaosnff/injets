import { ModuleOptions } from '../types';
export interface OnModuleInit {
    onModuleInit(): any;
}
export declare function Module(options: ModuleOptions): ClassDecorator;
