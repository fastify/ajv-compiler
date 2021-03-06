# ajv-compiler

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
![Continuous Integration](https://github.com/fastify/ajv-compiler/workflows/Continuous%20Integration/badge.svg)

This module manage all the [`ajv`](https://www.npmjs.com/package/ajv) instances for the Fastify framework.
It isolates the `ajv` dependancy to let you to choose the right schema compiler version for your application.


## Version

| `@fastify/ajv-compiler` | `ajv` | Default in `fastify` |
|------------------------:|------:|---------------------:|
|                    v1.x |  v6.x |                ^3.14 |


## Usage

This module is already used as default by Fastify.

If you need to provide to your server instance a different version, refer to [the official doc](https://www.fastify.io/docs/latest/Server/#schemacontroller).

## License

Licensed under [MIT](./LICENSE).
