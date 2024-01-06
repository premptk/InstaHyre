const bcrypt = require('bcrypt');
const dotenv = require('dotenv-safe');
dotenv.config({
    allowEmptyValues: true
});

const { Directory } = require('../../classes/directory');
const { Users } = require('./../../classes/users');
const addUserSchemaValidator = require('./schema');

const handler = async (console, req) => {
    return new Promise(async (resolve, reject) => {
        console.info('Execution start');
        try {
            let data = req.body;
            let isValid = addUserSchemaValidator(data);
            if(!isValid) {
                console.error(addUserSchemaValidator.errors);
                reject({
                    code: 400,
                    message: addUserSchemaValidator.errors[0].instancePath + ' ' + addUserSchemaValidator.errors[0].message
                });
            }
            
            // create token out of name + number + password
            const hashedpassword = await bcrypt.hash(data.password, 10); 
            await new Users().createUser(console, {name: data.name, number: data.number, password: hashedpassword});

            if(!data.email) data.email = null;
            data.isRegistered = 'YES';
            data.isSpam = 'NO';
            data.contactFrom = null;
            addUserRes = await new Directory().createUser(console, data);

            resolve(addUserRes);
        } catch (error) {
            console.error('Execution Error');
            reject(error);
        }
    });
};

module.exports = {
    handler
};