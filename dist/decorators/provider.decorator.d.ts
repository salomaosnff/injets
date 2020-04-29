export interface Dependecy {
    token: any;
    index?: number;
    required: boolean;
}
export declare function Provider(scope?: 'SINGLETON' | 'TRANSIENT'): ClassDecorator;
