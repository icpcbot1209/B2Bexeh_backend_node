
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('users', function(table){
          table.string('company_name');
          table.string('company_logo');

        })
      ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('users', function(table){
          
          table.dropColumn('company_name');
          table.dropColumn('company_logo');
        })
      ])
};
