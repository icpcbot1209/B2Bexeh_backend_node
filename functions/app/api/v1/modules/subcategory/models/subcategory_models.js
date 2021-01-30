var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var loader = require('app/api/v1/loader');
var i18n = require('i18n');
var SubcategoryModel = bookshelf.Model.extend({
  tableName: 'subcategory',
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
    var validate = Joi.object().keys({
      subcategory_id: Joi.any(),
      subcategory_name: Joi.any(),
      createdAt: Joi.date(),
      updatedAt: Joi.date(),
      isdeleted: Joi.boolean(),
      createdById: Joi.any(),
      updatedById: Joi.any(),
      category_id: Joi.any(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('SubcategoryModel', SubcategoryModel);
