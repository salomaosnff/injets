import { Constructor } from "../types";
import { ProviderRef } from "../provider";

export class ProviderNotFoundError extends Error {
  constructor (provider: Constructor | any, moduleName: string) {
    super(`${ProviderRef.getName(provider)} not found in ${moduleName} module context`)
  }
}
