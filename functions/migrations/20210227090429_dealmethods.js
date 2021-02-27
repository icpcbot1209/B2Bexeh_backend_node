// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema.createTable('dealmethods', (table) => {
    table.bigIncrements('id').primary().index();
    table.timestamps(true, true);
    table.string('status');

    table.string('name');
    table.bigInteger('priority');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('dealmethods');
};
