var bookshelf = require('app/config/bookshelf');
var santize = require('app/utils/santize');
var config = require('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var loader = require('app/api/v1/loader');
var i18n = require('i18n');
var UserModel = bookshelf.Model.extend({
  tableName: 'users',
  initialize: function () {
    this.on('creating', this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
    var validate = Joi.object().keys({
      user_id: Joi.any(),
      first_name: Joi.any(),
      last_name: Joi.any(),
      email: Joi.string(),
      password: Joi.any(),
      expire_password_expire: Joi.any(),
      phone_number: Joi.any(),
      address: Joi.any(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zip_code: Joi.string(),
      company_name: Joi.string(),
      company_logo: Joi.string(),

      profile_image_id: Joi.string(),
      created_at: Joi.date(),
      updated_at: Joi.date(),
      date_of_birth: Joi.date(),
      is_deleted: Joi.boolean(),
      is_active: Joi.boolean(),
      created_by_id: Joi.any(),
      verifying_token: Joi.any(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model('UserModel', UserModel);
