// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema
    .createTable('hopes', (table) => {
      table.bigIncrements('id').primary().index();
      table.bigInteger('creator_id');
      table.bigInteger('product_id');
      table.integer('qty').notNullable();
      table.double('price').notNullable();
      table.string('note');
      table.string('unit');
      table.string('deal_method');
      table.boolean('is_ask').notNullable();
      table.timestamps(true, true);
    })
    .createTable('offers', (table) => {
      table.bigIncrements('id').primary().index();
      table.bigInteger('hope_id');
      table.bigInteger('product_id');
      table.bigInteger('creator_id');
      table.bigInteger('seller_id');
      table.bigInteger('buyer_id');
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
