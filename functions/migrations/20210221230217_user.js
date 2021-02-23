// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // return bookshelf.knex.schema
  return knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary().index();
    table.timestamps(true, true);

    table.string('user_uid').notNullable(); // firebase uid
    table.string('role').notNullable();
    table.string('status').notNullable(); // active, pending, deleted

    table.string('photo_url');
    table.string('email');
    table.string('user_name');
    table.string('company_name');
    table.string('first_name');
    table.string('last_name');
    table.string('phone_number');
    table.string('billing_address_1');
    table.string('billing_address_2');
    table.string('billing_state');
    table.string('billing_city');
    table.string('billing_zipcode');
    table.string('shipping_address_1');
    table.string('shipping_address_2');
    table.string('shipping_city');
    table.string('shipping_state');
    table.string('shipping_zipcode');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
