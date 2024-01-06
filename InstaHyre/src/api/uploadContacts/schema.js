const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
require('ajv-errors')(ajv /*, {singleError: true} */);

const uploadContacts = {
  type: 'object',
  required: ['numbersToAdd'],
  properties: {
    numbersToAdd: { type: 'number', minimum: 1 }
  },
  additionalProperties: false
};

const uploadContactsSchemaValidator = ajv.compile(uploadContacts);

module.exports = uploadContactsSchemaValidator;  