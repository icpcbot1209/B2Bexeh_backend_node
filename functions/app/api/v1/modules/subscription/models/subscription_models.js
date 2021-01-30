var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var loader = require('app/api/v1/loader');
var i18n = require('i18n');
var SubscriptionModel = bookshelf.Model.extend({
  tableName: 'subscriptions',
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
    var validate = Joi.object().keys({
      plan_name: Joi.any(),
      amount: Joi.any(),
      tenure: Joi.any(),
      is_recurring: Joi.any(),
      created_at: Joi.date(),
      updated_at: Joi.date(),
      isdeleted: Joi.boolean(),
    });

    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('SubscriptionModel', SubscriptionModel);
