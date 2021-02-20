'use strict';
const baseUrl1 = 'http://localhost:9013/user/resetPassword/{verifying_token}';
const config = {
  default: {
    port: 9013,
    baseUrl: 'https://qa2.b2bexch.com/',
    ARTICLEIMAGE: '../../../../../uploads/articleImages', //local
    PRODUCTIMAGE: '../backend/app/uploads/productImages/',
    BULKUPLOADPATH: './app/uploads/bulkUpload/',

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
module.exports.get = function get(env) {
  return config[env] || config.default;
};
