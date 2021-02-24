// const bookshelf = require('app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema.createTable('products', (table) => {
    table.bigIncrements('id').primary().index();
    table.timestamps(true, true);
    table.string('status');

    table.string('name');
    table.bigInteger('category_id');
    table.bigInteger('subcategory_id');
    table.date('release_date');
    table.string('photo_url');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('products');
};
