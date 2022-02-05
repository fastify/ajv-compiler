'use strict'

const Ajv = require('ajv').default
const AjvJTD = require('ajv/dist/jtd')
const fastUri = require('fast-uri')

const AjvReference = Symbol.for('fastify.ajv-compiler.reference')

const defaultAjvOptions = {
  coerceTypes: 'array',
  useDefaults: true,
  removeAdditional: true,
  uriResolver: fastUri,
  // Explicitly set allErrors to `false`.
  // When set to `true`, a DoS attack is possible.
  allErrors: false
}

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

    if (options.customOptions.code !== undefined) {
      ret[AjvReference] = compiler
    }

    return ret
  }
}

class ValidatorCompiler {
  constructor (externalSchemas, options) {
    // This instance of Ajv is private
    // it should not be customized or used
    if (options.mode === 'JTD') {
      this.ajv = new AjvJTD(Object.assign({}, defaultAjvOptions, options.customOptions))
    } else {
      this.ajv = new Ajv(Object.assign({}, defaultAjvOptions, options.customOptions))
    }

    let addFormatPlugin = true
    if (options.plugins && options.plugins.length > 0) {
      for (const plugin of options.plugins) {
        if (Array.isArray(plugin)) {
          addFormatPlugin = addFormatPlugin && plugin[0].name !== 'formatsPlugin'
          plugin[0](this.ajv, plugin[1])
        } else {
          addFormatPlugin = addFormatPlugin && plugin.name !== 'formatsPlugin'
          plugin(this.ajv)
        }
      }
    }

    if (addFormatPlugin) {
      require('ajv-formats')(this.ajv)
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
module.exports.AjvReference = AjvReference
