//const config = require('./config.js').get('staging');
const config = require('./config.js').get(process.env.NODE_ENV);
var dbConfig = {
  client: config.db.client,
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    charset: config.db.charset,
    debug: config.db.debug,
    timezone: config.db.timezone,
  },
};

var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);
console.log(dbConfig);
console.log('Conencted successfully!');
module.exports = bookshelf;
