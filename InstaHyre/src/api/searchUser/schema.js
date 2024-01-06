const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
require('ajv-errors')(ajv /*, {singleError: true} */);

const searchUserSchema = {
  type: 'object',
  required: [],
  properties: {
    searchString: { type: 'string', minLength: 1 },
    number: { type: 'string', minLength: 1 }
  },
  additionalProperties: false
};

const searchUserSchemaValidator = ajv.compile(searchUserSchema);

module.exports = searchUserSchemaValidator;  