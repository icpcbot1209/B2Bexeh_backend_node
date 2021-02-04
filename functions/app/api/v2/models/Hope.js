var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');

var model = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'hopes',
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    var validate = Joi.object().keys({
      id: Joi.any(),
      is_ask: Joi.boolean(),
      note: Joi.string(),
      creator_id: Joi.string(),
      product_id: Joi.string(),
      qty: Joi.number(),
      price: Joi.number(),
      unit: Joi.string(),
      deal_method: Joi.string(),
      created_at: Joi.date(),
      updated_at: Joi.date(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('hopes', model);
