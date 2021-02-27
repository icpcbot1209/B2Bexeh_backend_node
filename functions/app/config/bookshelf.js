var knexConfig = require(process.env.KNEX_FILE || 'knexfile.js').development;

var knex = require('knex')(knexConfig);
var bookshelf = require('bookshelf')(knex);
console.log(knexConfig);
console.log('Conencted successfully!');
module.exports = bookshelf;
