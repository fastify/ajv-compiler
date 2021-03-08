# @fastify/ajv-compiler

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
![Continuous Integration](https://github.com/fastify/ajv-compiler/workflows/Continuous%20Integration/badge.svg)

This module manages the [`ajv`](https://www.npmjs.com/package/ajv) instances for the Fastify framework.
It isolates the `ajv` dependency so that the AJV version is not tightly coupled to the Fastify version.
This allows the user to decide which version of AJV to use in their Fastify based application.


## Version

| `@fastify/ajv-compiler` | `ajv` | Default in `fastify` |
|------------------------:|------:|---------------------:|
|                    v1.x |  v6.x |                ^3.14 |


### v1.x

This version has these default `ajv` options:

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

To customize them, see how in the [official docs](https://www.fastify.io/docs/latest/Server/#ajv).


### v2.x

**TBD**


## Usage

This module is already used as default by Fastify.

If you need to provide to your server instance a different version, refer to [the official doc](https://www.fastify.io/docs/latest/Server/#schemacontroller).

### How it works



## License

Licensed under [MIT](./LICENSE).
