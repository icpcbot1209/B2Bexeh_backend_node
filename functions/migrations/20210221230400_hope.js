// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema.createTable('hopes', (table) => {
    table.bigIncrements('id').primary().index();
    table.timestamps(true, true);

    table.bigInteger('creator_id');
    table.bigInteger('product_id');

    table.boolean('is_ask').notNullable();

    table.integer('qty').notNullable();
    table.double('price').notNullable();
    table.string('unit');
    table.string('deal_method');
    table.string('note');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('hopes');
};
