import { default as _ajv, Options } from "ajv";

export type ValidatorCompiler = (
  externalSchemas: unknown,
  options: Options
) => Ajv;

export declare function ValidatorSelector(): ValidatorCompiler;

export type { Options } from "ajv";
export type Ajv = _ajv;
export default ValidatorSelector;
