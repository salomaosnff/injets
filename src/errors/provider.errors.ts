import { Constructor } from "../types";

export class ProviderNotImportedError extends Error {
  constructor (providerRunning: Constructor, providerNotInjected: Constructor) {
    super(`Error while trying to inject provider "${providerNotInjected.name}" in provider "${providerRunning.name}": provider "${providerNotInjected.name}" type was not imported.`)
  }
}
