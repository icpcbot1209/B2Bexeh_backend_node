var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var loader = require('app/api/v1/loader');
var i18n = require('i18n');
var WatchListModel = bookshelf.Model.extend({
  tableName: 'watchlists',
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
    var validate = Joi.object().keys({
      user_id: Joi.any(),
      product_id: Joi.any(),
      status: Joi.any(),
      created_at: Joi.date(),
      updated_at: Joi.date(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('WatchListModel', WatchListModel);
