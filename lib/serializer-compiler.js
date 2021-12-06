'use strict'

const AjvJTD = require('ajv/dist/jtd')

const defaultAjvOptions = require('./default-ajv-options')

class SerializerCompiler {
  constructor (externalSchemas, options) {
    this.ajv = new AjvJTD(Object.assign({}, defaultAjvOptions, options))

    const sourceSchemas = Object.values(externalSchemas)
    for (const extSchema of sourceSchemas) {
      this.ajv.addSchema(extSchema)
    }
  }

  buildSerializerFunction ({ schema/*, method, url, httpStatus */ }) {
    return this.ajv.compileSerializer(schema)
  }
}

module.exports = SerializerCompiler
