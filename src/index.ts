import 'reflect-metadata'
import { Constructor, DynamicModule } from './types'
import { ModuleRef } from './module'
export * from './decorators'
export * from './types'
export * from './module'
export * from './provider'

export async function createModule(
  module: DynamicModule
): Promise<ModuleRef>;
export async function createModule<T extends Constructor>(
  module: T
): Promise<ModuleRef<T>>;
export async function createModule(
  module: any
) {
  return ModuleRef.create(module)
}
