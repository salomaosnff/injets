import "reflect-metadata";
import { Constructor, DynamicModule, Conditional } from "./types";
import { ModuleRef } from "./module";
export * from "./decorators";
export * from "./types";
export * from "./module";
export * from "./provider";

export function createModule(module: DynamicModule): ModuleRef;
export function createModule<T extends Constructor>(
  module: T
): ModuleRef<T>;
export function createModule(module: any): ModuleRef {
  return ModuleRef.create(module);
}
