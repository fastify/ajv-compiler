# @fastify/ajv-compiler

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
[![Continuous Integration](https://github.com/fastify/ajv-compiler/workflows/Continuous%20Integration/badge.svg)](https://github.com/fastify/ajv-compiler/actions/workflows/ci.yml)

This module manages the [`ajv`](https://www.npmjs.com/package/ajv) instances for the Fastify framework.
It isolates the `ajv` dependency so that the AJV version is not tightly coupled to the Fastify version.
This allows the user to decide which version of AJV to use in their Fastify based application.


## Versions

| `@fastify/ajv-compiler` | `ajv` | Default in `fastify` |
|------------------------:|------:|---------------------:|
|                    v1.x |  v6.x |                ^3.14 |
|                    v2.x |  v8.x |                  TBD |


### AJV Configuration

The Fastify's default [`ajv` options](https://github.com/ajv-validator/ajv/tree/v6#options) are:

```js
{
  coerceTypes: true,
  useDefaults: true,
  removeAdditional: true,
  // Explicitly set allErrors to `false`.
  // When set to `true`, a DoS attack is possible.
  allErrors: false,
  nullable: true
}
```

To customize them, see how in the [Fastify official docs](https://www.fastify.io/docs/latest/Server/#ajv).


## Usage

This module is already used as default by Fastify. 
If you need to provide to your server instance a different version, refer to [the official doc](https://www.fastify.io/docs/latest/Server/#schemacontroller).

### Fastify with JTD

The [JSON Type Definition](https://jsontypedef.com/) feature is supported by AJV v8.x and you can benefit from it in your Fastify application.

With Fastify v3.20.x and higher, you can use the `@fastify/ajv-compiler` module to load JSON Type Definitions like so:

```js
const factory = require('@fastify/ajv-compiler')()

const app = fastify({
  jsonShorthand: false,
  ajv: {
    customOptions: { }, // additional JTD options
    mode: 'JTD'
  },
  schemaController: {
    compilersFactory: {
      buildValidator: factory
    }
  }
})
```

The defaults AJV JTD options are the same as the [Fastify's default options](#AJV-Configuration).

### AJV Standalone

AJV v8 introduces the [standalone feature](https://ajv.js.org/standalone.html) that let you to pre-compile your schemas and use them in your application
for a faster cold start.

To use this feature, you must be aware of the following:

1. You must generate and save the compiled schemas to a file using [AJV](https://ajv.js.org/standalone.html#usage-with-cli).
2. Read the compiled schemas from the file and provide them to your Fastify application.

#### Generate and save the compiled schemas

To accomplish this, you must do the following:

```js
```

### How it works

This module provide a factory function to produce [Validator Compilers](https://www.fastify.io/docs/latest/Server/#validatorcompiler) functions.

The Fastify factory function is just one per server instance and it is called for every encapsulated context created by the application through the `fastify.register()` call.

Every Validator Compiler produced has a dedicated AJV instance, so, this factory will try to produce as less as possible AJV instances to reduce the memory footprint and the startup time.

The variables involved to choose if a Validator Compiler can be reused are:

- the AJV configuration: it is [one per server](https://www.fastify.io/docs/latest/Server/#ajv)
- the external JSON schemas: once a new schema is added to a fastify's context, calling `fastify.addSchema()`, it will cause a new AJV inizialization


## License

Licensed under [MIT](./LICENSE).
