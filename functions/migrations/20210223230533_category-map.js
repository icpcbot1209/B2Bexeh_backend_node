// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema.createTable('categorymap', (table) => {
    table.bigIncrements('id').primary().index();
    table.timestamps(true, true);
    table.string('status');

    table.bigInteger('category_id');
    table.bigInteger('subcategory_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('categorymap');
};
