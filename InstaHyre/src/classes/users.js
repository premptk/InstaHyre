const client = require('../../helper/postgres/index');
const getNewid = require('../helper/idGenerator');

class Users {
    // constructor() { }
    createUser(console, data) {
        return new Promise(async (resolve, reject) => {
            console.info('createUser execution started');
            console.info('data = ', JSON.stringify(data));
            const query = `INSERT INTO users (id, name, number, password) VALUES ($1,$2,$3,$4) returning *`;
            let id = getNewid();
            try {
                let result = await client.query(query, [id, data.name, data.number, data.password], console);
                console.info('Successfully added a user');
                return resolve(result.rows[0]);
            }
            catch (err) {
                console.error('Error in createUser = ');
                console.error(err);
                reject({});
            }
        });
    }

    getUserByNameNumber(console, obj) {
        return new Promise(async (resolve, reject) => {
            console.info('getUserByNameNumber execution started');
            let j = 1;
            let queryarr = [];
            let query = `SELECT * from users where `;
            Object.keys(obj).forEach((ele)=>{
                query+=`"${ele}" = $${j++} and `;
                queryarr.push(obj[ele]);
            })
            query = query.slice(0, -4);
            try {
                console.info('query = ', query);
                console.info('queryarr = ', JSON.stringify(queryarr));
                let result = await client.query(query, queryarr, console);
                console.info('Successfully fetched user = ' + JSON.stringify(result.rows[0]));
                if (result.rows[0]) {
                    return resolve(result.rows);
                }
                else {
                    console.error(`No such record exists`);
                    reject({
                        code: 404,
                        message: 'user not found in directory'
                    });
                }
            }
            catch (err) {
                console.error('Error in getUserByNameNumber = ');
                console.error(err);
                reject({});
            }
        });
    }

}

module.exports = {
    Users
};