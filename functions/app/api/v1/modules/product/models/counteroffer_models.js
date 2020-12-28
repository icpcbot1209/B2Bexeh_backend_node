var bookshelf = __rootRequire("app/config/bookshelf");
var santize = __rootRequire("app/utils/santize");
var config = __rootRequire("app/config/constant");
var moment = require("moment");
var Joi = require("joi");

var CounterOffer = bookshelf.Model.extend({
  tableName: "counters",
  initialize: function () {
    this.on("creating", this.onCreating);
  },
  onCreating: function () {
    let self = this;
    self.attributes = santize.striptags(self.attributes);
    self.attributes.created = moment
      .utc()
      .format(config.MOMENT_DATE_TIME_FORMAT);
    var validate = Joi.object().keys({
      bid_and_ask_id: Joi.any(),
      seller_id: Joi.any(),
      bidder_id: Joi.any(),
      expiry_date: Joi.date(),
      type_of: Joi.any(),
      is_deleted: Joi.boolean(),
      is_read: Joi.boolean(),
      shipment_date: Joi.any(),
      payment_date: Joi.any(),
      type_of_offer: Joi.any(),
      payment_time: Joi.any(),
      expiry_day: Joi.any(),
      product_id: Joi.any(),
      payment_method: Joi.any(),
      qty: Joi.any(),
      amount: Joi.any(),
      total_amount: Joi.any(),
      note: Joi.any(),
      track_no: Joi.any(),
    });
    Joi.validate(self.attributes, validate, {}, (err, value) => {
      if (err) throw err.details[0].message;
    });
  },
});

module.exports = bookshelf.model("counters", CounterOffer);
