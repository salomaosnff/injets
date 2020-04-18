interface InjectOptions {
    required?: boolean;
}
export declare function Inject(token?: any, options?: InjectOptions): ParameterDecorator & PropertyDecorator;
export {};
