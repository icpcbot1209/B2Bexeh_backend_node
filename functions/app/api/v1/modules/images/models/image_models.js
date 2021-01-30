var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var loader = require('app/api/v1/loader');
var i18n = require('i18n');
var ImageModel = bookshelf.Model.extend({
  tableName: 'images',
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
    var validate = Joi.object().keys({
      imageId: Joi.any(),
      productId: Joi.any(),
      createdAt: Joi.date(),
      updatedAt: Joi.date(),
      isDeleted: Joi.boolean(),
      createdById: Joi.any(),
      updatedById: Joi.any(),
      imageUrl: Joi.any(),
      userId: Joi.any(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('ImageModel', ImageModel);
