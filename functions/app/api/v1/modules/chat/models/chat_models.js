var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var loader = require('app/api/v1/loader');
var i18n = require('i18n');
var chatsModel = bookshelf.Model.extend({
  tableName: 'chats',
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
    var validate = Joi.object().keys({
      my_id: Joi.any(),
      contact_id: Joi.any(),
      message: Joi.any(),
      date_to_group: Joi.date(),
      created_at: Joi.date(),
      updated_at: Joi.date(),
      isdelete: Joi.boolean(),
      type: Joi.any(),
      room_id: Joi.any(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('chatsModel', chatsModel);
