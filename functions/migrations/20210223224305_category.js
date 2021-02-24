// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema.createTable('categories', (table) => {
    table.bigIncrements('id').primary().index();
    table.timestamps(true, true);
    table.string('status');

    table.string('name');
    table.integer('priority');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('categories');
};
