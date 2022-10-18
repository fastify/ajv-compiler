import { AnySchemaObject } from "ajv";
import { expectAssignable, expectType } from "tsd";
import  ValidatorSelector, { ValidatorCompiler, StandaloneValidator, RouteDefinition, ErrorObject } from "../..";

const compiler = ValidatorSelector();
expectType<ValidatorCompiler>(compiler);

const reader = StandaloneValidator({
  readMode: true,
  restoreFunction: (route: RouteDefinition) => {
    expectAssignable<RouteDefinition>(route)
  },
});
expectType<ValidatorCompiler>(reader);

const writer = StandaloneValidator({
  readMode: false,
  storeFunction: (route: RouteDefinition, code: string) => {
    expectAssignable<RouteDefinition>(route)
    expectAssignable<string>(code)
  },
});
expectType<ValidatorCompiler>(writer);

expectType<unknown>(({} as ErrorObject).data)
expectType<string>(({} as ErrorObject).instancePath)
expectType<string>(({} as ErrorObject).keyword)
expectType<string | undefined>(({} as ErrorObject).message)
expectType<Record<string, any>>(({} as ErrorObject).params)
expectType<AnySchemaObject | undefined>(({} as ErrorObject).parentSchema)
expectType<string | undefined>(({} as ErrorObject).propertyName)
expectType<unknown>(({} as ErrorObject).schema)
expectType<string>(({} as ErrorObject).schemaPath)