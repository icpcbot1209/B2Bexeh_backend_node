// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema
    .createTable('hopes', (table) => {
      table.increments('id').primary();
      table.integer('creator_id');
      table.integer('product_id');
      table.integer('qty').notNullable();
      table.double('price').notNullable();
      table.string('note');
      table.string('unit');
      table.string('deal_method');
      table.boolean('is_ask').notNullable();
      table.timestamps(true, true);
    })
    .createTable('offers', (table) => {
      table.increments('id').primary();
      table.integer('hope_id');
      table.integer('product_id');
      table.integer('creator_id');
      table.integer('seller_id');
      table.integer('buyer_id');
      table.integer('qty').notNullable();
      table.double('price').notNullable();
      table.string('note');
      table.integer('payment_method').notNullable();
      table.integer('payment_timing').notNullable();
      table.boolean('is_active').notNullable();
      table.boolean('is_accepted').notNullable();
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('hopes').dropTable('offers');
};
