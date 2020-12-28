
var bookshelf = __rootRequire('app/config/bookshelf');
var santize = __rootRequire('app/utils/santize');
var config = __rootRequire('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var loader = __rootRequire('app/api/v1/loader');
var i18n = require("i18n");
var bidsasksModel = bookshelf.Model.extend({
    tableName: 'bid_and_ask',
    initialize: function () {
        this.on('creating', this.onCreating);
    },
    onCreating: function () {
        let self = this;
        self.attributes = santize.striptags(self.attributes);
        self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
        var validate = Joi.object().keys({
            "request": Joi.any(),
            "productId": Joi.any(),
            "minQuantity": Joi.string(),
            "maxQuantity": Joi.string(),
            "producttype": Joi.any(),
            "amount": Joi.any(),
            "isdeleted":Joi.boolean(),
            "isaddtocart":Joi.boolean(),
            "createdAt": Joi.any(),
            "updatedAt": Joi.any(),
            "createdbyId":Joi.any(),
            "updatedbyId":Joi.any(),
            "type":Joi.any(),
            "subtype":Joi.any(),
            "note":Joi.any(),


        });
        Joi.validate(self.attributes, validate, {
        }, (err, value) => {
            if (err) throw (err.details[0].message);
        });
    },

});

module.exports = bookshelf.model('bidsasksModel', bidsasksModel);