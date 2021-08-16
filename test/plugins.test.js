'use strict'

const t = require('tap')
const fastify = require('fastify')
const AjvCompiler = require('../index')

t.test('Baseline test', async (t) => {
  const app = buildApplication({
    customOptions: {
      validateFormats: false
    }
  })

  const res = await app.inject({
    url: '/hello',
    headers: {
      'x-foo': 'hello',
      'x-date': 'not a date',
      'x-email': 'not an email'
    },
    query: {
      foo: 'hello',
      date: 'not a date',
      email: 'not an email'
    }
  })
  t.equal(res.statusCode, 200, 'format validation does not apply as configured')
  t.equal(res.payload, 'hello')
})

t.test('Format test', (t) => {
  t.plan(6)
  const app = buildApplication({
    customOptions: {
      validateFormats: true,
      allErrors: true
    },
    plugins: [require('ajv-formats')]
  })

  app.inject('/hello', (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 400, 'format validation applies')
  })

  app.inject('/2ad0612c-7578-4b18-9a6f-579863f40e0b', (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 400, 'format validation applies')
  })

  app.inject({
    url: '/2ad0612c-7578-4b18-9a6f-579863f40e0b',
    headers: {
      'x-foo': 'hello',
      'x-date': new Date().toISOString(),
      'x-email': 'foo@bar.baz'
    },
    query: {
      foo: 'hello',
      date: new Date().toISOString(),
      email: 'foo@bar.baz'
    }
  }, (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 200)
  })
})

function buildApplication (ajvOptions) {
  const factory = AjvCompiler()

  const app = fastify({
    ajv: ajvOptions,
    schemaController: {
      compilersFactory: {
        buildValidator: factory
      }
    }
  })

  app.get('/:id', {
    schema: {
      headers: {
        type: 'object',
        required: [
          'x-foo',
          'x-date',
          'x-email'
        ],
        properties: {
          'x-foo': { type: 'string' },
          'x-date': { type: 'string', format: 'date-time' },
          'x-email': { type: 'string', format: 'email' }
        }
      },
      query: {
        type: 'object',
        required: [
          'foo',
          'date',
          'email'
        ],
        properties: {
          foo: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          email: { type: 'string', format: 'email' }
        }
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async () => 'hello')

  return app
}
