const dotenv = require('dotenv-safe');
dotenv.config({
    allowEmptyValues: true
});
const getRandomUser = require('./../../helper/generateRandomUser.js');

const { Directory } = require('../../classes/directory');
const uploadContactsSchemaValidator = require('./schema');

const handler = async (console, req) => {
    return new Promise(async (resolve, reject) => {
        console.info('Execution start');
        try {
            let data = req.body;
            let isValid = uploadContactsSchemaValidator(data);
            if(!isValid) {
                console.error(uploadContactsSchemaValidator.errors);
                reject({
                    code: 400,
                    message: uploadContactsSchemaValidator.errors[0].instancePath + ' ' + uploadContactsSchemaValidator.errors[0].message
                });
            }

            // adding numbersToAdd number of user 
            for(let i = 0; i < data.numbersToAdd; i++){
                const userData = getRandomUser();
                userData.isRegistered = 'NO';
                userData.isSpam = 'NO';
                userData.contactFrom = req.user.id;
                console.info('Adding user with data - ', userData);
                await new Directory().createUser(console, userData);
            }
            resolve({
                code: '200',
                message: `Successfully ${data.numbersToAdd} phone numbers added from contact list of ${req.user.name}!`
            });
        } catch (error) {
            console.error('Execution Error');
            reject(error);
        }
    });
};

module.exports = {
    handler
};