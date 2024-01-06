const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
require('ajv-errors')(ajv /*, {singleError: true} */);

const loginUserSchema = {
  type: 'object',
  required: ['name', 'number', 'password'],
  properties: {
    name: { type: 'string', minLength: 1 },
    number: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 4 }
  },
  additionalProperties: false
};

const loginUserSchemaValidator = ajv.compile(loginUserSchema);

module.exports = loginUserSchemaValidator;  