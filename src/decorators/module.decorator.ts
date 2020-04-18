import {
  MODULE_IMPORTS,
  MODULE_PROVIDER,
  MODULE_EXPORTS
} from '../meta/module.meta'
import { ModuleOptions } from '../types'

export interface OnModuleInit {
  onModuleInit(): any
}

export function Module(options: ModuleOptions): ClassDecorator {
  return function(target) {
    Reflect.defineMetadata(MODULE_IMPORTS, options.imports, target)
    Reflect.defineMetadata(MODULE_PROVIDER, options.providers, target)
    Reflect.defineMetadata(MODULE_EXPORTS, options.exports, target)
  }
}
