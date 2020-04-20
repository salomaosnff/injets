interface InjectOptions {
    required?: boolean;
}
export declare function Inject(token?: any, options?: InjectOptions): ParameterDecorator & PropertyDecorator;
export declare function InjectOptional(token?: any): ParameterDecorator & PropertyDecorator;
export {};
