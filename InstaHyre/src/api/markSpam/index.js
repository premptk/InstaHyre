const dotenv = require('dotenv-safe');
dotenv.config({
    allowEmptyValues: true
});

const { Directory } = require('../../classes/directory');
const markSpamSchemaValidator = require('./schema');

const handler = async (console, req) => {
    return new Promise(async (resolve, reject) => {
        console.info('Execution start');
        try {
            let data = req.body;
            let isValid = markSpamSchemaValidator(data);
            if(!isValid) {
                console.error(markSpamSchemaValidator.errors);
                reject({
                    code: 400,
                    message: markSpamSchemaValidator.errors[0].instancePath + ' ' + markSpamSchemaValidator.errors[0].message
                });
            }
            
            const promises = data.spamNumbers.map(async (number) => {
                try {
                    await new Directory().makeContactSpam(console, { number });
                } catch (error) {
                    console.error('Error in updating status');
                    reject(error);
                }
            });

            await Promise.all(promises);
            resolve(`Successfully updated status!`);
            
        } catch (error) {
            console.error('Execution Error');
            reject(error);
        }
    });
};

module.exports = {
    handler
};