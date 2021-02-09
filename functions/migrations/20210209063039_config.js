// const bookshelf = require('../app/config/bookshelf');

exports.up = function (knex) {
  // const schema = bookshelf.knex.schema;
  const schema = knex.schema;
  return schema.createTable('configs', (table) => {
    table.bigIncrements('id').primary().index();
    table.timestamps(true, true);

    table.bigInteger('creator_id');

    table.string('json_key');
    table.string('json_value', 2000);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('configs');
};
