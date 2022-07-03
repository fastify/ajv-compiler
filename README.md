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
|                    v2.x |  v8.x |                    - |
|                    v3.x |  v8.x |                 ^4.x |


### AJV Configuration

The Fastify's default [`ajv` options](https://github.com/ajv-validator/ajv/tree/v6#options) are:

```js
{
  coerceTypes: 'array',
  useDefaults: true,
  removeAdditional: true,
  uriResolver: require('fast-uri'),
  addUsedSchema: true,
  // Explicitly set allErrors to `false`.
  // When set to `true`, a DoS attack is possible.
  allErrors: false
}
```

Moreover, the [`ajv-formats`](https://www.npmjs.com/package/ajv-formats) module is included by default.
If you need to customize check the usage section below.

To customize them, see how in the [Fastify official docs](https://www.fastify.io/docs/latest/Reference/Server/#ajv).


## Usage

This module is already used as default by Fastify. 
If you need to provide to your server instance a different version, refer to [the official doc](https://www.fastify.io/docs/latest/Reference/Server/#schemacontroller).

### Customize the `ajv-formats` plugin

The `format` keyword is not part of the official `ajv` module since v7. To use it, you need to install the `ajv-formats` module and this module
does it for you with the default configuration.

If you need to configure the `ajv-formats` plugin you can do it using the standard Fastify configuration:

```js
const app = fastify({
  ajv: {
    plugins: [[require('ajv-formats'), { mode: 'fast' }]]
  }
})
```

In this way, your setup will have precendence over the `@fastify/ajv-compiler` default configuration.

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

AJV v8 introduces the [standalone feature](https://ajv.js.org/standalone.html) that let you to pre-compile your schemas and use them in your application for a faster startup.

To use this feature, you must be aware of the following:

1. You must generate and save the application's compiled schemas.
2. Read the compiled schemas from the file and provide them back to your Fastify application.


#### Generate and save the compiled schemas

Fastify helps you to generate the validation schemas functions and it is your choice to save them where you want.
To accomplish this, you must use a new compiler: `@fastify/ajv-compiler/standalone`.

You must provide 2 parameters to this compiler:

- `readMode: false`: a boolean to indicate that you want generate the schemas functions string.
- `storeFunction`" a sync function that must store the source code of the schemas functions. You may provide an async function too, but you must manage errors.

When `readMode: false`, **the compiler is meant to be used in development ONLY**.


```js
const factory = require('@fastify/ajv-compiler/standalone')({
  readMode: false,
  storeFunction (routeOpts, schemaValidationCode) {
    // routeOpts is like: { schema, method, url, httpPart }
    // schemaValidationCode is a string source code that is the compiled schema function
    const fileName = generateFileName(routeOpts)
    fs.writeFileSync(path.join(__dirname, fileName), schemaValidationCode)
  }
})

const app = fastify({
  jsonShorthand: false,
  schemaController: {
    compilersFactory: {
      buildValidator: factory
    }
  }
})

// ... add all your routes with schemas ...

app.ready().then(() => {
  // at this stage all your schemas are compiled and stored in the file system
  // now it is important to turn off the readMode
})
```

#### Read the compiled schemas functions

At this stage, you should have a file for every route's schema.
To use them, you must use the `@fastify/ajv-compiler/standalone` with the parameters:

- `readMode: true`: a boolean to indicate that you want read and use the schemas functions string.
- `restoreFunction`" a sync function that must return a function to validate the route.

Important keep away before you continue reading the documentation:

- when you use the `readMode: true`, the application schemas are not compiled (they are ignored). So, if you change your schemas, you must recompile them!
- as you can see, you must relate the route's schema to the file name using the `routeOpts` object. You may use the `routeOpts.schema.$id` field to do so, it is up to you to define a unique schema identifier.

```js
const factory = require('@fastify/ajv-compiler/standalone')({
  readMode: true,
  restoreFunction (routeOpts, schemaValidationCode) {
    // routeOpts is like: { schema, method, url, httpPart }
    const fileName = generateFileName(routeOpts)
    return require(path.join(__dirname, fileName))
  }
})

const app = fastify({
  jsonShorthand: false,
  schemaController: {
    compilersFactory: {
      buildValidator: factory
    }
  }
})

// ... add all your routes with schemas as before...

app.listen(3000)
```

### How it works

This module provide a factory function to produce [Validator Compilers](https://www.fastify.io/docs/latest/Reference/Server/#validatorcompiler) functions.

The Fastify factory function is just one per server instance and it is called for every encapsulated context created by the application through the `fastify.register()` call.

Every Validator Compiler produced has a dedicated AJV instance, so, this factory will try to produce as less as possible AJV instances to reduce the memory footprint and the startup time.

The variables involved to choose if a Validator Compiler can be reused are:

- the AJV configuration: it is [one per server](https://www.fastify.io/docs/latest/Reference/Server/#ajv)
- the external JSON schemas: once a new schema is added to a fastify's context, calling `fastify.addSchema()`, it will cause a new AJV inizialization


## License

Licensed under [MIT](./LICENSE).
