import { PROVIDER_SCOPE } from '../meta/provider.meta'

export function Provider(scope = 'SINGLETON'): ClassDecorator {
  return function(target) {
    Reflect.defineMetadata(PROVIDER_SCOPE, scope, target)
  }
}
