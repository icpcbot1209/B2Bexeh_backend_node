var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var uuidv4 = require('uuid/v4');

var model = bookshelf.Model.extend({
  tableName: 'offers',
  hasTimestamps: true,
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.id = uuidv4();

    var validate = Joi.object().keys({
      id: Joi.any(),
      hopeId: Joi.string(),
      qty: Joi.number(),
      price: Joi.number(),
      creatorId: Joi.string(),
      note: Joi.string(),
      payment: Joi.any(),
      shipment: Joi.any(),
      isActive: Joi.boolean(),
      isAccepted: Joi.boolean(),
      created_at: Joi.date(),
      updated_at: Joi.date(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('offers', model);
