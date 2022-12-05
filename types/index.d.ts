import { AnySchema,  default as _ajv, Options as AjvOptions, ValidateFunction } from "ajv";
import { default as AjvJTD, JTDOptions } from "ajv/dist/jtd";
import type { Options, ErrorObject } from "ajv";

type AjvSerializerGenerator = typeof AjvCompiler

declare namespace AjvCompiler {
  export type { Options, ErrorObject }
  export type Ajv = _ajv;

  type AjvJTDCompile = AjvJTD['compileSerializer']
  type AjvCompile = Ajv['compile']

  export type BuildSerializerFromPool = (externalSchemas: any, serializerOpts: JTDOptions) => AjvJTDCompile

  export type BuildCompilerFromPool =
    ((externalSchemas: { [key: string]: AnySchema | AnySchema[] }, options?: { mode: 'JTD', customOptions?: JTDOptions }) => ReturnType<AjvCompile>) |
    ((externalSchemas: { [key: string]: AnySchema | AnySchema[] }, options?: { mode?: undefined, customOptions?: AjvOptions }) => ReturnType<AjvCompile>)

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

  export type StandaloneOptionsReadModeOn = {
    readMode: true;
    restoreFunction?: StandaloneRestoreFunction
  }

  export type StandaloneOptionsReadModeOff = {
    readMode?: false | undefined;
    storeFunction?: StandaloneStoreFunction;
  }

  export type StandaloneOptions = StandaloneOptionsReadModeOn | StandaloneOptionsReadModeOff

  export type ValidatorCompiler = BuildCompilerFromPool | BuildSerializerFromPool

  export type StandaloneRestoreFunction = (opts: RouteDefinition) => ValidateFunction

  export type StandaloneStoreFunction = (opts: RouteDefinition, schemaValidationCode: string) => void

  export const AjvCompiler: AjvSerializerGenerator
  export { AjvCompiler as default }
}

declare function AjvCompiler<T = unknown>(opts?: { jtdSerializer: true }): AjvCompiler.BuildSerializerFromPool
declare function AjvCompiler<T = unknown>(opts?: { jtdSerializer?: false | undefined }): AjvCompiler.BuildCompilerFromPool

declare function StandaloneValidator(options: AjvCompiler.StandaloneOptions): AjvCompiler.ValidatorCompiler;

export = AjvCompiler
