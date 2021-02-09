// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema
    .createTable('hopes', (table) => {
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
    })
    .createTable('offers', (table) => {
      table.bigIncrements('id').primary().index();
      table.timestamps(true, true);

      table.string('status');

      table.bigInteger('hope_id');
      table.bigInteger('product_id');
      table.bigInteger('creator_id');
      table.bigInteger('seller_id');
      table.bigInteger('buyer_id');

      // status = sent
      table.integer('qty').notNullable();
      table.double('price').notNullable();
      table.string('unit');
      table.string('deal_method');
      table.string('note');
      table.string('payment_terms');
      table.string('shipping_terms');

      // status = accepted
      table.boolean('is_paid');
      table.boolean('is_shipped');

      // status = completed
      table.string('feedback2seller');
      table.string('feedback2buyer');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('hopes').dropTable('offers');
};
