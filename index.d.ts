import { default as _ajv, Options } from "ajv";

export enum HttpParts {
  Body = "body",
  Headers = "headers",
  Params = "params",
  Query = "querystring",
}

export type RouteDefinition = {
  method: string,
  url: string,
  httpPart: HttpParts,
  schema?: unknown,
}

export interface StandaloneOptions {
  readMode: Boolean,
  storeFunction?(opts: RouteDefinition, schemaValidationCode: string): void,
  restoreFunction?(opts: RouteDefinition): void,
}

declare function StandaloneValidator(options: StandaloneOptions): ValidatorCompiler;

export type ValidatorCompiler = (
  externalSchemas: unknown,
  options: Options
) => Ajv;

export declare function ValidatorSelector(): ValidatorCompiler;

export type { Options } from "ajv";
export type Ajv = _ajv;
export default ValidatorSelector;
export { StandaloneValidator };
