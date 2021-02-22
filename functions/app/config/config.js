const config = {
  default: {
    port: 9013,

    db: {
      client: 'pg',
      host: '34.121.102.7',
      username: 'postgres',
      password: 'uy9E9dMpvHO567EDvoiQWFJ8324',
      database: 'postgres',
      charset: 'utf8',
      debug: true,
      timezone: 'UTC',
      port: 5432,
    },
  },
};
module.exports.get = function get(env = 'local') {
  return config[env] || config.default;
};
