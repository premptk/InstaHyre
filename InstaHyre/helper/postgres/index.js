// add postgres client
const { Pool } = require('pg');

const dotenv = require('dotenv-safe');
dotenv.config({
  allowEmptyValues: false
});

const pool = new Pool(
  {
    connectionString: process.env.SQL_CONNECTION_STR
  });

module.exports = {
  query: async (text, params, log) =>{
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    log.info('executed query', JSON.stringify({ text, duration, rows: res.rowCount }));
    return res;
  },
  getClient :async (log)=> {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      log.error('A client has been checked out for more than 5 seconds!');
      log.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, process.env.DB_REQUEST_TIMEOUT);
    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    client.release = () => {
      // clear our timeout
      clearTimeout(timeout);
      // set the methods back to their old un-monkey-patched version
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    return client;
  }
};

