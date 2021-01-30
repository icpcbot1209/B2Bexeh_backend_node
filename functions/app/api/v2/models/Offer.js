var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');

var Offer = bookshelf.Model.extend({
  tableName: 'offers',
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.timestamp = Date.now();
    var validate = Joi.object().keys({
      seller_id: Joi.string(),
      buyer_id: Joi.string(),
      offer_type: Joi.string(),
      product_id: Joi.string(),
      is_deleted: Joi.boolean(),
      is_read: Joi.boolean(),
      shipment_date: Joi.date(),
      payment_date: Joi.date(),
      payment_method: Joi.string(),
      expiry_date: Joi.date(),
      qty: Joi.number(),
      amount: Joi.number(),
      note: Joi.string(),
      parent_id: Joi.string(),
      timestamp: Joi.number(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('offers', Offer);
