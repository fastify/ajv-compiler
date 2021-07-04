'use strict'

const Ajv = require('ajv').default

function ValidatorSelector () {
  const validatorPool = new Map()

  return function buildCompilerFromPool (externalSchemas, options) {
    const externals = JSON.stringify(externalSchemas)
    const ajvConfig = JSON.stringify(options.customOptions)

    const uniqueAjvKey = `${externals}${ajvConfig}`
    if (validatorPool.has(uniqueAjvKey)) {
      return validatorPool.get(uniqueAjvKey)
    }

    const compiler = new ValidatorCompiler(externalSchemas, options)
    const ret = compiler.buildValidatorFunction.bind(compiler)
    validatorPool.set(uniqueAjvKey, ret)

    ret[Symbol.for('fastify.ajv-compiler.reference')] = compiler

    return ret
  }
}

class ValidatorCompiler {
  constructor (externalSchemas, options) {
    // This instance of Ajv is private
    // it should not be customized or used
    this.ajv = new Ajv(Object.assign({
      coerceTypes: true,
      useDefaults: true,
      removeAdditional: true,
      // Explicitly set allErrors to `false`.
      // When set to `true`, a DoS attack is possible.
      allErrors: false
    }, options.customOptions))

    if (options.plugins && options.plugins.length > 0) {
      for (const plugin of options.plugins) {
        if (Array.isArray(plugin)) {
          plugin[0](this.ajv, plugin[1])
        } else {
          plugin(this.ajv)
        }
      }
    }

    const sourceSchemas = Object.values(externalSchemas)
    for (const extSchema of sourceSchemas) {
      this.ajv.addSchema(extSchema)
    }
  }

  buildValidatorFunction ({ schema/*, method, url, httpPart */ }) {
    // Ajv does not support compiling two schemas with the same
    // id inside the same instance. Therefore if we have already
    // compiled the schema with the given id, we just return it.
    if (schema.$id) {
      const stored = this.ajv.getSchema(schema.$id)
      if (stored) {
        return stored
      }
    }

    return this.ajv.compile(schema)
  }
}

module.exports = ValidatorSelector
