'use strict'

const fs = require('fs')
const path = require('path')
const t = require('tap')
const standaloneCode = require('ajv/dist/standalone').default
const AjvCompiler = require('../index')

const sym = Symbol.for('fastify.ajv-compiler.reference')

const sampleSchema = Object.freeze({
  $id: 'example1',
  type: 'object',
  properties: {
    name: { type: 'string' }
  }
})

const externalSchemas1 = Object.freeze({})
const externalSchemas2 = Object.freeze({
  foo: {
    $id: 'foo',
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  }
})

const fastifyAjvOptionsDefault = Object.freeze({
  customOptions: {}
})

const fastifyAjvOptionsCustom = Object.freeze({
  customOptions: {
    allErrors: true,
    removeAdditional: false
  },
  plugins: [
    require('ajv-formats'),
    [require('ajv-errors'), { singleError: false }]
  ]
})

t.test('basic usage', t => {
  t.plan(1)
  const factory = AjvCompiler()
  const compiler = factory(externalSchemas1, fastifyAjvOptionsDefault)
  const validatorFunc = compiler({ schema: sampleSchema })
  const result = validatorFunc({ name: 'hello' })
  t.equal(result, true)
})

t.test('plugin loading', t => {
  t.plan(3)
  const factory = AjvCompiler()
  const compiler = factory(externalSchemas1, fastifyAjvOptionsCustom)
  const validatorFunc = compiler({
    schema: {
      type: 'object',
      properties: {
        q: {
          type: 'string',
          format: 'date',
          formatMinimum: '2016-02-06',
          formatExclusiveMaximum: '2016-12-27'
        }
      },
      required: ['q'],
      errorMessage: 'hello world'
    }
  })
  const result = validatorFunc({ q: '2016-10-02' })
  t.equal(result, true)

  const resultFail = validatorFunc({})
  t.equal(resultFail, false)
  t.equal(validatorFunc.errors[0].message, 'hello world')
})

t.test('optimization - cache ajv instance', t => {
  t.plan(5)
  const factory = AjvCompiler()
  const compiler1 = factory(externalSchemas1, fastifyAjvOptionsDefault)
  const compiler2 = factory(externalSchemas1, fastifyAjvOptionsDefault)
  t.equal(compiler1, compiler2, 'same instance')
  t.same(compiler1, compiler2, 'same instance')

  const compiler3 = factory(externalSchemas2, fastifyAjvOptionsDefault)
  t.not(compiler3, compiler1, 'new ajv instance when externa schema change')

  const compiler4 = factory(externalSchemas1, fastifyAjvOptionsCustom)
  t.not(compiler4, compiler1, 'new ajv instance when externa schema change')
  t.not(compiler4, compiler3, 'new ajv instance when externa schema change')
})

// https://github.com/fastify/fastify/pull/2969
t.test('compile same $id when in external schema', t => {
  t.plan(3)
  const factory = AjvCompiler()

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

  const compiler = factory({
    [base.$id]: base,
    [refSchema.$id]: refSchema

  }, fastifyAjvOptionsDefault)

  t.notOk(compiler[sym], 'the ajv reference do not exists if code is not activated')

  const validatorFunc1 = compiler({
    schema: {
      $id: 'urn:schema:ref'
    }
  })

  const validatorFunc2 = compiler({
    schema: {
      $id: 'urn:schema:ref'
    }
  })

  t.pass('the compile does not fail if the schema compiled is already in the external schemas')
  t.equal(validatorFunc1, validatorFunc2, 'the returned function is the same')
})

t.test('STANDALONE MODE', t => {
  t.plan(1)

  t.test('generate standalone code', t => {
    t.plan(3)

    const factory = AjvCompiler()

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

    const compiler = factory({
      [base.$id]: base,
      [refSchema.$id]: refSchema
    }, {
      customOptions: {
        code: { source: true }
      }
    })

    const theValidatorFunction = compiler(endpointSchema)
    t.pass('compiled the endpoint schema')
    t.ok(compiler[sym], 'the ajv reference exists')

    // const schemaValidationCode = standaloneCode(compiler[sym].ajv) //generates a json map
    const schemaValidationCode = standaloneCode(compiler[sym].ajv, theValidatorFunction) // generates a single function
    fs.writeFileSync(path.join(__dirname, '/validate.js'), schemaValidationCode)

    t.test('usage standalone code', t => {
      t.plan(1)
      const standaloneValidate = require('./validate')
      // TODO usage

      // const requireFromString = require("require-from-string")
      // const standaloneValidate = requireFromString(moduleCode) // for a single default export

      t.ok(standaloneValidate)
    })
  })
})
