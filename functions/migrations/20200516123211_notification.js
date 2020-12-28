exports.up = function(knex, Promise) {  
    return Promise.all([
      knex.schema.createTable('notifications', function(table){
        table.string('created_by');
        table.string('content');
        table.string('destnation_user_id');
        // table.date('created_at');
        // table.date('updated_at');
        table.boolean('is_deleted');
        table.boolean('is_read');


        table.timestamps();
      })
    ])
  };
  
  exports.down = function(knex, Promise) {  
    return Promise.all([
      knex.schema.dropTable('notifications')
    ])
  };