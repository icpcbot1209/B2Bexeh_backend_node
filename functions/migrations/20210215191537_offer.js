// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema.createTable('offers', (table) => {
    table.bigIncrements('id').primary().index();
    table.timestamps(true, true);

    table.string('status');

    table.bigInteger('hope_id');
    table.bigInteger('product_id');
    table.bigInteger('creator_id');
    table.bigInteger('seller_id');
    table.bigInteger('buyer_id');

    table.integer('qty').notNullable();
    table.double('price').notNullable();
    table.string('unit');
    table.string('deal_method');
    table.string('note');
    table.string('payment_terms');
    table.string('shipping_terms');
    table.string('paid_info');
    table.date('paid_at');
    table.string('shipped_info');
    table.date('shipped_at');

    // status
    table.boolean('is_accepted');
    table.boolean('is_paid');
    table.boolean('is_shipped');
    table.string('feedback2seller');
    table.string('feedback2buyer');

    table.boolean('is_canceled');
    table.boolean('is_deleted');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('offers');
};
