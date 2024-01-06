const dotenv = require('dotenv-safe');
dotenv.config({
    allowEmptyValues: true
});

const { Directory } = require('../../classes/directory');
const searchUserSchemaValidator = require('./schema');

const handler = async (console, req) => {
    return new Promise(async (resolve, reject) => {
        console.info('Execution start');
        try {
            let data = req.body;
            let isValid = searchUserSchemaValidator(data);
            if(!isValid) {
                console.error(searchUserSchemaValidator.errors);
                reject({
                    code: 400,
                    message: searchUserSchemaValidator.errors[0].instancePath + ' ' + searchUserSchemaValidator.errors[0].message
                });
            }
            
            let searchUserRes = null;
            if(data.searchString){
                searchUserRes = await new Directory().searchByName(console, {str : data.searchString});
            }
            else if(data.number){
                searchUserRes = await new Directory().searchByNumber(console, {number : data.number});
            }
            else{
                reject({
                    status: 400,
                    message : "Please enter name or number to search"
                });
            }

            // filter out email from result if not a Registered user or not from your own contact list
            searchUserRes.forEach(item => {
                if (! (item.isRegistered === 'YES' && item.contactFrom === req.user.id)){
                    delete item.email;
                }
            });
            resolve(searchUserRes);
        } catch (error) {
            console.error('Execution Error');
            reject(error);
        }
    });
};

module.exports = {
    handler
};