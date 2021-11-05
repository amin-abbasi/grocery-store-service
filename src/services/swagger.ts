// Open http://<app_host>:<app_port>/docs in your browser to view the documentation.
import swaggerJSDoc from 'swagger-jsdoc'
import config from '../configs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const myPackage = require('../../package.json')

const { SWAGGER_URL } = config.env

const swaggerDefinition: swaggerJSDoc.SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: myPackage.name,
    version: myPackage.version,
    description: myPackage.description,
    license: { name: myPackage.license, url: 'http://aminaeon.ir/licenses' },
    contact: { name: myPackage.author, email: 'amin4193@gmail.com' }
  },
  servers: [{ url: `${SWAGGER_URL}/api/v1` }],
  // basePath: '/v1',
  // schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json']
  // host: url, // Host (optional)
  // securityDefinitions: {
  //   JWT: {
  //       type: 'apiKey',
  //       in: 'header',
  //       name: 'Authorization',
  //       description: "JWT Token for user's authorization",
  //   }
  // }
}

const options: swaggerJSDoc.Options = {
  swaggerDefinition: swaggerDefinition,
  // Path files to be processes. for: {openapi: '3.0.0'}
  apis: [
    './dist/routes/*.js',
    './dist/models/*.js'
  ],
  definition: swaggerDefinition
  // files: ['../routes/*.js', '../models/*.js'],  // Path files to be processes. for: {swagger: '2.0'}
  // basedir: __dirname, //app absolute path
  // onValidateError: (errors, req, res, next) => { // global handler for validation errors
  //   res.status(400).send(errors)
  // },
}

const specs = swaggerJSDoc(options)
module.exports = specs
