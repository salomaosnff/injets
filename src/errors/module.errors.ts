import { Constructor } from "../types";

export class ProviderNotFoundError extends Error {
  constructor (provider: Constructor | any, moduleName: string) {
    super(`Provider ${provider} not found in ${moduleName} module context`)
  }
}
