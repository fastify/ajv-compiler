import { AnySchemaObject, ValidateFunction } from 'ajv'
import { AnyValidateFunction } from 'ajv/dist/core'
import { expect } from 'tstyche'
import AjvCompiler, {
  AjvReference,
  ValidatorFactory,
  StandaloneValidator,
  RouteDefinition,
  ErrorObject,
  BuildCompilerFromPool,
  BuildSerializerFromPool,
  ValidatorCompiler
} from '..'
import type Ajv from 'ajv'

{
  const compiler = AjvCompiler({})
  expect(compiler).type.toBe<BuildCompilerFromPool>()
}
{
  const compiler = AjvCompiler()
  expect(compiler).type.toBe<BuildCompilerFromPool>()
}
{
  const compiler = AjvCompiler({ jtdSerializer: false })
  expect(compiler).type.toBe<BuildCompilerFromPool>()
}

{
  const factory = AjvCompiler({ jtdSerializer: false })
  expect(factory).type.toBe<BuildCompilerFromPool>()
  factory(
    {},
    {
      onCreate (ajv) {
        expect(ajv).type.toBe<Ajv>()
      }
    }
  )
}

{
  const compiler = AjvCompiler({ jtdSerializer: true })
  expect(compiler).type.toBe<BuildSerializerFromPool>()
}

const reader = StandaloneValidator({
  readMode: true,
  restoreFunction: (route) => {
    expect(route).type.toBe<RouteDefinition>()
    return {} as ValidateFunction
  }
})
expect(reader).type.toBeAssignableTo<ValidatorFactory>()

const writer = StandaloneValidator({
  readMode: false,
  storeFunction: (route, code: string) => {
    expect(route).type.toBe<RouteDefinition>()
    expect(code).type.toBe<string>()
  }
})
expect(writer).type.toBeAssignableTo<ValidatorFactory>()

expect(({} as ErrorObject).data).type.toBe<unknown>()
expect(({} as ErrorObject).instancePath).type.toBe<string>()
expect(({} as ErrorObject).keyword).type.toBe<string>()
expect(({} as ErrorObject).message).type.toBe<string | undefined>()
expect(({} as ErrorObject).params).type.toBe<Record<string, any>>()
expect(({} as ErrorObject).parentSchema).type.toBe<
  AnySchemaObject | undefined
>()
expect(({} as ErrorObject).propertyName).type.toBe<string | undefined>()
expect(({} as ErrorObject).schema).type.toBe<unknown>()
expect(({} as ErrorObject).schemaPath).type.toBe<string>()

expect(AjvReference).type.toBe<Symbol>()

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
  expect(factory).type.toBe<BuildSerializerFromPool>()
  const compiler = factory(externalSchemas1, {})
  expect(compiler).type.toBeAssignableTo<Function>()
  const serializeFunc = compiler({ schema: jtdSchema })
  expect(serializeFunc).type.toBe<(data: unknown) => string>()
  expect(serializeFunc({ version: '1', foo: 42 })).type.toBe<string>()
}

// JTD
{
  const factory = AjvCompiler()
  expect(factory).type.toBe<BuildCompilerFromPool>()

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

  const compiler = factory(
    {},
    {
      customOptions: {},
      mode: 'JTD'
    }
  )
  expect(compiler).type.toBeAssignableTo<ValidatorCompiler>()
  const validatorFunc = compiler({ schema: jtdSchema })
  expect(validatorFunc).type.toBeAssignableTo<ValidateFunction>()

  expect(
    validatorFunc({
      version: '2',
      foo: []
    })
  ).type.toBe<boolean | Promise<any>>()
}

// generate standalone code
{
  const base = {
    $id: 'urn:schema:base',
    definitions: {
      hello: { type: 'string' }
    },
    type: 'object',
    properties: {
      hello: { $ref: '#/definitions/hello' }
    }
  }

  const refSchema = {
    $id: 'urn:schema:ref',
    type: 'object',
    properties: {
      hello: { $ref: 'urn:schema:base#/definitions/hello' }
    }
  }

  const endpointSchema = {
    schema: {
      $id: 'urn:schema:endpoint',
      $ref: 'urn:schema:ref'
    }
  }

  const schemaMap = {
    [base.$id]: base,
    [refSchema.$id]: refSchema
  }

  const factory = StandaloneValidator({
    readMode: false,
    storeFunction (routeOpts, schemaValidationCode) {
      expect(routeOpts).type.toBe<RouteDefinition>()
      expect(schemaValidationCode).type.toBe<string>()
    }
  })
  expect(factory).type.toBeAssignableTo<ValidatorFactory>()

  const compiler = factory(schemaMap)
  expect(compiler).type.toBeAssignableTo<ValidatorCompiler>()
  expect(compiler(endpointSchema)).type.toBe<AnyValidateFunction>()
}

{
  const base = {
    $id: 'urn:schema:base',
    definitions: {
      hello: { type: 'string' }
    },
    type: 'object',
    properties: {
      hello: { $ref: '#/definitions/hello' }
    }
  }

  const refSchema = {
    $id: 'urn:schema:ref',
    type: 'object',
    properties: {
      hello: { $ref: 'urn:schema:base#/definitions/hello' }
    }
  }

  const endpointSchema = {
    schema: {
      $id: 'urn:schema:endpoint',
      $ref: 'urn:schema:ref'
    }
  }

  const schemaMap = {
    [base.$id]: base,
    [refSchema.$id]: refSchema
  }

  const factory = StandaloneValidator({
    readMode: true,
    restoreFunction (routeOpts) {
      expect(routeOpts).type.toBe<RouteDefinition>()
      return {} as ValidateFunction
    }
  })
  expect(factory).type.toBeAssignableTo<ValidatorFactory>()

  const compiler = factory(schemaMap)
  expect(compiler).type.toBeAssignableTo<ValidatorCompiler>()
  expect(compiler(endpointSchema)).type.toBe<AnyValidateFunction>()
}

// Plugins
{
  const factory = AjvCompiler()
  const compilerFactoryParams = {
    customOptions: {},
    plugins: [
      (ajv: Ajv) => {
        expect(ajv).type.toBe<Ajv>()
        return ajv
      },
      (ajv: Ajv, options: unknown) => {
        expect(ajv).type.toBe<Ajv>()
        expect(options).type.toBe<unknown>()
        return ajv
      }
    ]
  }
  expect([
    {},
    compilerFactoryParams
  ] as Parameters<BuildCompilerFromPool>).type.toBeAssignableTo<
    Parameters<BuildCompilerFromPool>
  >()

  const compiler = factory(
    {},
    {
      customOptions: {},
      plugins: [
        (ajv) => {
          expect(ajv).type.toBe<Ajv>()
          return ajv
        },
        (ajv, options) => {
          expect(ajv).type.toBe<Ajv>()
          expect(options).type.toBe<unknown>()
          return ajv
        }
      ]
    }
  )
  expect(compiler).type.toBeAssignableTo<ValidatorCompiler>()
}

// Compiler factory should allow both signatures (mode: JTD and mode omitted)
{
  expect<BuildCompilerFromPool>().type.toBeCallableWith({}, {})
  const ajvPlugin = (ajv: Ajv): Ajv => {
    expect(ajv).type.toBe<Ajv>()
    return ajv
  }
  expect<BuildCompilerFromPool>()
    .type.toBeCallableWith(
      {},
      { plugins: [ajvPlugin] }
    )

  expect<BuildCompilerFromPool>()
    .type.toBeCallableWith(
      {},
      {
        mode: 'JTD',
        customOptions: { removeAdditional: 'all' },
        plugins: [ajvPlugin]
      }
    )

  expect<BuildCompilerFromPool>()
    .type.toBeCallableWith(
      {},
      {
        mode: 'JTD',
        customOptions: { removeAdditional: 'all' },
        plugins: [[ajvPlugin, ['string1', 'string2']]]
      }
    )

  expect<BuildCompilerFromPool>()
    .type.toBeCallableWith(
      {},
      {
        plugins: [
          ajvPlugin,
          (ajv: Ajv, options: unknown): Ajv => {
            expect(ajv).type.toBe<Ajv>()
            expect(options).type.toBe<unknown>()
            return ajv
          },
          [ajvPlugin, ['keyword1', 'keyword2']],
          [ajvPlugin, [{ key: 'value' }]]
        ]
      }
    )
}
