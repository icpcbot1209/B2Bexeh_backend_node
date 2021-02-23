// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '34.121.102.7',
      port: 5432,
      user: 'postgres',
      password: 'uy9E9dMpvHO567EDvoiQWFJ8324',
      database: 'superfractor',
      charset: 'utf8',
      debug: true,
      timezone: 'UTC',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
