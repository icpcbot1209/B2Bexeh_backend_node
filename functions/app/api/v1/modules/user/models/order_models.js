
var bookshelf = __rootRequire('app/config/bookshelf');
var santize = __rootRequire('app/utils/santize');
var config = __rootRequire('app/config/constant');
var moment = require('moment');
var Joi = require('joi');

var Orders = bookshelf.Model.extend({
    tableName: 'orders',
    initialize: function () {
        this.on('creating', this.onCreating);
    },
    onCreating: function () {
        let self = this;
        self.attributes = santize.striptags(self.attributes);
        self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
        var validate = Joi.object().keys({            
            "bid_ask_id":Joi.any(),
            "status": Joi.any(),
            "product_id": Joi.any(),
            "is_deleted":Joi.boolean(),
            "track_no": Joi.any(),
            "courier": Joi.any(),
            "paymentdetail": Joi.any(),
            "delivered":Joi.boolean(),      
        });
        Joi.validate(self.attributes, validate, {
        }, (err, value) => {
            if (err) throw (err.details[0].message);
        });
    },

});

module.exports = bookshelf.model('orders', Orders);