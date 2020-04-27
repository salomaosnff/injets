import { PROVIDER_SCOPE, PROVIDER_DEPENDENCIES } from '../meta/provider.meta'

export interface Dependecy {
  token: any;
  index?: number;
  required: boolean;
}

export function Provider(scope = 'SINGLETON'): ClassDecorator {
  return function(target) {
    Reflect.defineMetadata(PROVIDER_SCOPE, scope, target)

    const deps: Dependecy[] = Reflect.getMetadata(PROVIDER_DEPENDENCIES, target) || []
    const paramsDeps = (Reflect.getMetadata('design:paramtypes', target) || [])
      .map((token: any, index: number) => ({
        token,
        index,
        required: true
      }))
      .filter(({ index }: Dependecy) => deps.every(dep => dep.index !== index))

    Reflect.defineMetadata(PROVIDER_DEPENDENCIES, paramsDeps.concat(deps), target)
  }
}
