var moment = require('moment');
const config = require('./config.js').get(process.env.NODE_ENV);

module.exports = {
    'MOMENT_DATE_TIME_FORMAT': 'YYYY-MM-DD HH:mm:ss',
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: 'HH12:MIAM',
    statusCode: {
        'success': '1',
        'successCode': 1,
        'errorCode': 0,
        'badRequest': '2',
        'unauthorized': '3',
        'forbidden': '5',
        'notFound': '4',
        'error': '0',
        'invalid': '0',
        'serviceUnavailable': '6',
    },
    PAGINATION: {
        LIMIT: 5,
        ORDER_BY: 'created',
        SORT_DIRECTION: 'desc'
    },
    CONFIG: {
        cryptoAlgorithm: "aes-256-ctr",
        cryptoPassword : 'd6F3Efeq'
    },
    secret: 'ifgmQikpa3Y906u9m8aV1qndV4sj8r4vG8p3kdu7IaRIdIidlf',
        
    
};