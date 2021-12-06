'use strict'

const t = require('tap')
const fastify = require('fastify')
const AjvCompiler = require('../index')

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

const externalSchemas1 = Object.freeze({})

const fastifyAjvOptionsDefault = Object.freeze({
  customOptions: {}
})

t.test('basic serializer usage', t => {
  t.plan(4)
  const factory = AjvCompiler({ asSerializer: true })
  const compiler = factory(externalSchemas1, fastifyAjvOptionsDefault)
  const serializeFunc = compiler({ schema: jtdSchema })
  t.equal(serializeFunc({ version: '1', foo: 42 }), '{"version":"1","foo":42}')
  t.equal(serializeFunc({ version: '2', foo: 'hello' }), '{"version":"2","foo":"hello"}')
  t.equal(serializeFunc({ version: '3', foo: 'hello' }), '{"version":"3"}')
  t.equal(serializeFunc({ version: '2', foo: ['not', 1, { string: 'string' }] }), '{"version":"2","foo":"not,1,[object Object]"}')
})

t.test('fastify integration within JTD validation', async t => {
  const factoryValidator = AjvCompiler()
  const factorySerializer = AjvCompiler({ asSerializer: true })

  const app = fastify({
    jsonShorthand: false,
    ajv: {
      customOptions: { },
      mode: 'JTD'
    },
    schemaController: {
      compilersFactory: {
        buildValidator: factoryValidator,
        buildSerializer: factorySerializer
      }
    }
  })

  app.post('/', {
    schema: {
      body: jtdSchema,
      response: {
        200: {
          properties: {
            id: { type: 'string' },
            createdAt: { type: 'timestamp' },
            karma: { type: 'int32' },
            isAdmin: { type: 'boolean' }
          }
        },
        400: jtdSchema
      }
    }
  }, async () => {
    return {
      id: '123',
      createdAt: new Date(1999, 1, 1),
      karma: 42,
      isAdmin: true,
      remove: 'me'
    }
  })

  {
    const res = await app.inject({
      url: '/',
      method: 'POST',
      payload: {
        version: '1',
        foo: 'not a number'
      }
    })

    t.equal(res.statusCode, 400)
    t.same(res.json(), { version: 'undefined' })
  }

  {
    const res = await app.inject({
      url: '/',
      method: 'POST',
      payload: {
        version: '1',
        foo: 32
      }
    })

    t.equal(res.statusCode, 200)
    t.same(res.json(), {
      id: '123',
      createdAt: '1999-01-31T23:00:00.000Z',
      karma: 42,
      isAdmin: true
    })
  }
})
