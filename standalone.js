'use strict'

const ValidatorSelector = require('./index')
const standaloneCode = require('ajv/dist/standalone').default

function StandaloneValidator (options = { readMode: true }) {
  if (options.readMode === true && !options.restoreValidation) {
    throw new Error('You must provide a restoreValidation options when readMode ON')
  }

  if (options.readMode !== true && !options.storeValidation) {
    throw new Error('You must provide a storeValidation options when readMode OFF')
  }

  if (options.readMode === true) {
    /*************/
    // READ MODE: it behalf only in the restore function provided by the user
    return function wrapper () {
      return function (opts) {
        return options.restoreValidation(opts)
      }
    }
  }

  /*************/
  // WRITE MODE: it behalf on the default ValidatorSelector, wrapping the API to run the Ajv Standalone code generation
  const factory = ValidatorSelector()
  return function wrapper (externalSchemas, ajvOptions = {}) {
    if (!ajvOptions.customOptions || !ajvOptions.customOptions.code) {
      // to generate the validation source code, these options are mandatory
      ajvOptions.customOptions = Object.assign({}, ajvOptions.customOptions, { code: { source: true } })
    }

    const compiler = factory(externalSchemas, ajvOptions)
    return function (opts) { // { schema/*, method, url, httpPart */ }
      const validationFunc = compiler(opts)

      const schemaValidationCode = standaloneCode(compiler[ValidatorSelector.AjvReference].ajv, validationFunc)
      options.storeValidation(opts, schemaValidationCode)

      return validationFunc
    }
  }
}

module.exports = StandaloneValidator
