'use strict'

const t = require('tap')
const AjvCompiler = require('../index')

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
    require('ajv-merge-patch'),
    [require('ajv-errors'), { singleError: false }]
  ]
})

t.test('basic usage', t => {
  t.plan(1)
  const factory = AjvCompiler()
  const compiler = factory(externalSchemas1, fastifyAjvOptionsDefault)
  const validatorFunc = compiler({ schema: sampleSchema })
  const result = validatorFunc({ name: 'hello' })
  t.equals(result, true)
})

t.test('plugin loading', t => {
  t.plan(3)
  const factory = AjvCompiler()
  const compiler = factory(externalSchemas1, fastifyAjvOptionsCustom)
  const validatorFunc = compiler({
    schema: {
      $merge: {
        source: {
          type: 'object',
          properties: {
            q: {
              type: 'string'
            }
          },
          errorMessage: 'hello world'
        },
        with: {
          required: ['q']
        }
      }
    }
  })
  const result = validatorFunc({ q: 'hello' })
  t.equals(result, true)

  const resultFail = validatorFunc({ })
  t.equals(resultFail, false)
  t.equals(validatorFunc.errors[0].message, 'hello world')
})

t.test('optimization - cache ajv instance', t => {
  t.plan(5)
  const factory = AjvCompiler()
  const compiler1 = factory(externalSchemas1, fastifyAjvOptionsDefault)
  const compiler2 = factory(externalSchemas1, fastifyAjvOptionsDefault)
  t.equals(compiler1, compiler2, 'same instance')
  t.deepEquals(compiler1, compiler2, 'same instance')

  const compiler3 = factory(externalSchemas2, fastifyAjvOptionsDefault)
  t.notEqual(compiler3, compiler1, 'new ajv instance when externa schema change')

  const compiler4 = factory(externalSchemas1, fastifyAjvOptionsCustom)
  t.notEqual(compiler4, compiler1, 'new ajv instance when externa schema change')
  t.notEqual(compiler4, compiler3, 'new ajv instance when externa schema change')
})
