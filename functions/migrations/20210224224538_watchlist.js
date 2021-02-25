// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema.createTable('watchlist', (table) => {
    table.bigIncrements('id').primary().index();
    table.timestamps(true, true);
    table.string('status');

    table.bigInteger('user_id');
    table.bigInteger('product_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('watchlist');
};
