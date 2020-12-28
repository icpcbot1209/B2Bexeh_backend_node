
var bookshelf = __rootRequire('app/config/bookshelf');
var santize = __rootRequire('app/utils/santize');
var config = __rootRequire('app/config/constant');
var moment = require('moment');
var Joi = require('joi');
var loader = __rootRequire('app/api/v1/loader');
var i18n = require("i18n");
var FeedbackModel = bookshelf.Model.extend({
    tableName: 'feedbacks',
    initialize: function () {
        this.on('creating', this.onCreating);
    },
    onCreating: function () {
        let self = this;
        self.attributes = santize.striptags(self.attributes);
        self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
        var validate = Joi.object().keys({
           
            "bid_and_ask_id": Joi.any(),
            "feedback_by_bidder": Joi.any(),
            
            "counters_id": Joi.any(),
            "status": Joi.any(),
            "feedback_by_seller": Joi.any(),
            "created_at":Joi.date(),
            "updated_at":Joi.date(),
            "isdeleted":Joi.boolean(),
          
        });



        
        Joi.validate(self.attributes, validate, {
        }, (err, value) => {
            if (err) throw (err.details[0].message);
        });
    },

});

module.exports = bookshelf.model('FeedbackModel', FeedbackModel);