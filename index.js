'use strict'

const AjvReference = Symbol.for('fastify.ajv-compiler.reference')
const ValidatorCompiler = require('./lib/validator-compiler')

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

module.exports = ValidatorSelector
module.exports.AjvReference = AjvReference
