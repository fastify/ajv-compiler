import { AnySchemaObject, ValidateFunction } from "ajv";
import { expectAssignable, expectType } from "tsd";
import AjvCompiler, { AjvReference, ValidatorCompiler, StandaloneValidator, RouteDefinition, ErrorObject, BuildCompilerFromPool, BuildSerializerFromPool } from "..";

const compiler = AjvCompiler({});
expectType<BuildCompilerFromPool>(compiler);

const reader = StandaloneValidator({
  readMode: true,
  restoreFunction: (route: RouteDefinition) => {
    expectAssignable<RouteDefinition>(route)
    return {} as ValidateFunction
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

expectType<Symbol>(AjvReference)

{
  const jtdSchema = {
    discriminator: 'version',
    mapping: {
      1: {
        properties: {
          foo: { type: 'uint8' }
        }
      },
      2: {
        properties: {
          foo: { type: 'string' }
        }
      }
    }
  }

  const externalSchemas1 = {
    foo: {
      definitions: {
        coordinates: {
          properties: {
            lat: { type: 'float32' },
            lng: { type: 'float32' }
          }
        }
      }
    }
  }

  const factory = AjvCompiler({ jtdSerializer: true })
  expectType<BuildSerializerFromPool>(factory)
  const compiler = factory(externalSchemas1, {})
  expectAssignable<Function>(compiler)
  const serializeFunc = compiler({ schema: jtdSchema })
  expectType<(data: unknown) => string>(serializeFunc)
  expectType<string>(serializeFunc({ version: '1', foo: 42 }))
}
