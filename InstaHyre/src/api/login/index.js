const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv-safe');
dotenv.config({
    allowEmptyValues: true
});

const { Users } = require('./../../classes/users');
const loginUserSchemaValidator = require('./schema');

const handler = async (console, req) => {
    return new Promise(async (resolve, reject) => {
        console.info('Execution start');
        try {
            let data = req.body;
            let isValid = loginUserSchemaValidator(data);
            if(!isValid) {
                console.error(loginUserSchemaValidator.errors);
                reject({
                    code: 400,
                    message: loginUserSchemaValidator.errors[0].instancePath + ' ' + loginUserSchemaValidator.errors[0].message
                });
            }
            
            // Check if password is correct
            const res = await new Users().getUserByNameNumber(console, {name : data.name, number: data.number});
            const isPasswordCorrect = await bcrypt.compare(data.password, res[0].password); 
            if (!isPasswordCorrect) {
                reject({
                    code: '404',
                    message: `Please enter correct credentials!`
                });
            }

            const mysecretkey = process.env.SECRET_CODE;

            console.info('res - ', res);
            const payload = {
                id: res[0].id,
                name: data.name,
                number: data.number,
                password: data.password,
            };
            console.info('payload - ', payload);
            // Create a jsonwebtoken that expires in 5 days
            const token = jwt.sign(payload, mysecretkey, { expiresIn: '5d' });
            delete res[0].password;
            res[0].token = token;
            resolve(res);
        } catch (error) {
            console.error('Execution Error');
            reject(error);
        }
    });
};

module.exports = {
    handler
};