import { default as _ajv } from "ajv";
import type { Options, ErrorObject } from "ajv";

type AjvCompilerFn = typeof AjvCompiler

declare namespace AjvCompiler {
  export type { Options, ErrorObject }
  export type Ajv = _ajv;
  
  export { StandaloneValidator }

  export const AjvReference: Symbol

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

  export type ValidatorCompiler = (
    externalSchemas: unknown,
    options: Options
  ) => Ajv;

  export const AjvCompiler: AjvCompilerFn
  export { AjvCompiler as default }
}

declare function AjvCompiler(): AjvCompiler.ValidatorCompiler;
declare function StandaloneValidator(options: AjvCompiler.StandaloneOptions): AjvCompiler.ValidatorCompiler;

export = AjvCompiler
