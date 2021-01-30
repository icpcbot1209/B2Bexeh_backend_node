var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var loader = require('app/api/v1/loader');
var i18n = require('i18n');
var NotificationModel = bookshelf.Model.extend({
  tableName: 'notifications',
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
    var validate = Joi.object().keys({
      created_by: Joi.any(),
      content: Joi.string(),
      destnation_user_id: Joi.any(),
      created_at: Joi.date(),
      updated_at: Joi.date(),
      is_deleted: Joi.boolean(),
      is_read: Joi.boolean(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('NotificationModel', NotificationModel);
