
var bookshelf = __rootRequire('app/config/bookshelf');
var santize = __rootRequire('app/utils/santize');
var config = __rootRequire('app/config/constant');
var moment = require('moment');
var Joi = require('joi');

var TxnHistory = bookshelf.Model.extend({
    tableName: 'transaction_history',
    initialize: function () {
        this.on('creating', this.onCreating);
    },
    onCreating: function () {
        let self = this;
        self.attributes = santize.striptags(self.attributes);
        self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
        var validate = Joi.object().keys({            
            "id":Joi.any(),
            "total_txn_lifetime": Joi.any(),
            "createdAt": Joi.date(),
            "updatedAt": Joi.date(),
            "is_deleted":Joi.boolean(),   
            "userId": Joi.any()   
        });
        Joi.validate(self.attributes, validate, {
        }, (err, value) => {
            if (err) throw (err.details[0].message);
        });
    },

});

module.exports = bookshelf.model('txnHistory', TxnHistory);