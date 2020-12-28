// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      // filename: './dev.sqlite3'
      host     : 'b2bexchange-stg-db1.cuc7kbjlu2vp.us-west-2.rds.amazonaws.com',
      port: 5432,
      user : 'b2bpostgres',
      password : 'Qd!74Rd!07Xe4p3&5M5',
      database : 'b2b_marketplace',
      charset: 'utf8'

    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

  // staging: {
  //   client: 'pg',
  //   connection: {
  //     // database: 'my_db',
  //     // user:     'username',
  //     // password: 'password',
      
  //           host     : '54.71.18.74',
  //           port: 5435,
  //           user : 'b2bmarket',
  //           password : 'Password@sn01',
  //           database : 'b2b_marketplace',
  //           charset: 'utf8'
            
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }

};
