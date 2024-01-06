const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
require('ajv-errors')(ajv /*, {singleError: true} */);

const markSpamSchema = {
  type: 'object',
  required: ['spamNumbers'],
  properties: {
    spamNumbers: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      minItems: 1,
    },
  },
  additionalProperties: false,
};

const markSpamSchemaValidator = ajv.compile(markSpamSchema);

module.exports = markSpamSchemaValidator;  