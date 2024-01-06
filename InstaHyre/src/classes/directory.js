const client = require('../../helper/postgres/index');
const getNewid = require('../helper/idGenerator');

class Directory {
    // constructor() { }
    createUser(console, data) {
        return new Promise(async (resolve, reject) => {
            console.info('createUser execution started');
            console.info('data = ', JSON.stringify(data));
            const query = `INSERT INTO directory (id, name, number, email, "isRegistered", "contactFrom", "isSpam") VALUES ($1,$2,$3,$4,$5,$6,$7) returning *`;
            let id = getNewid();
            try {
                let result = await client.query(query, [id, data.name, data.number, data.email, data.isRegistered, data.contactFrom, data.isSpam], console);
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
            let query = `SELECT * from directory where `;
            Object.keys(obj).forEach((ele)=>{
                query+=`"${ele}" = $${j++} and `;
                queryarr.push(obj[ele]);
            })
            query = query.slice(0, -4);
            try {
                console.info('query = ', query);
                console.info('queryarr = ', JSON.stringify(queryarr));
                let result = await client.query(query, [queryarr], console);
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

    makeContactSpam(console, obj) {
        return new Promise(async (resolve, reject) => {
            console.info('obj - ', obj);
            console.info('makeContactSpam execution started');
            let query = `update directory set "isSpam" = 'YES' `;
            let queryarr = [];
            let queryIndex = 1;
            query += ` where number = $${queryIndex} returning *;`
            queryarr.push(obj.number);
            console.info('query = ', query);
            console.info('queryarr = ', JSON.stringify(queryarr));
            try {
                console.info('query = ', query);
                console.info('queryarr = ', JSON.stringify(queryarr));
                let result = await client.query(query, queryarr, console);
                console.info('Successfully updated user spam status = ' + JSON.stringify(result.rows[0]));
                if (result.rows[0]) {
                    return resolve(result.rows);
                }
                else {
                    console.error(`No records found`);
                    reject({
                        code: 404,
                        message: 'user not found in records'
                    });
                }
            }
            catch (err) {
                console.error('Error in makeContactSpam = ');
                console.error(err);
                reject({});
            }
        });
    }

    searchByName(console, data) {
        return new Promise(async (resolve, reject) => {
            console.info('searchByName execution started');
            let query = `SELECT *
                        FROM directory
                        WHERE name LIKE $1
                        OR name LIKE $2
                        ORDER BY 
                        CASE WHEN name LIKE $3 THEN 0 ELSE 1 END,
                        name; `;
            try {
                console.info('query = ', query);
                let result = await client.query(query, [data.str+'%', '%' + data.str + '%', data.str+'%'], console);
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
                console.error('Error in searchByName = ');
                console.error(err);
                reject({});
            }
        });
    }

    searchByNumber(console, data) {
        return new Promise(async (resolve, reject) => {
            console.info('searchByNumber execution started');
            let query = `SELECT *
                        FROM directory
                        WHERE number = $1
                        AND (
                            "isRegistered" = 'YES'
                            OR NOT EXISTS (
                                SELECT 1
                                FROM directory
                                WHERE number = $2 AND "isRegistered" = 'YES'
                            )
                        ); `;
            try {
                console.info('query = ', query);
                let result = await client.query(query, [data.number, data.number], console);
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
                console.error('Error in searchByNumber = ');
                console.error(err);
                reject({});
            }
        });
    }

}

module.exports = {
    Directory
};