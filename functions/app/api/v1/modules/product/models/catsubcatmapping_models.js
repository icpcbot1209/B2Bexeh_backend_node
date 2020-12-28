
var bookshelf = __rootRequire('app/config/bookshelf');
var santize = __rootRequire('app/utils/santize');
var config = __rootRequire('app/config/constant');
var moment = require('moment');
var Joi = require('joi');

var CatSubcatMappingModel = bookshelf.Model.extend({
    tableName: 'cat_subcat_mapping',
    initialize: function () {
        this.on('creating', this.onCreating);
    },
    onCreating: function () {
        let self = this;
        self.attributes = santize.striptags(self.attributes);
        self.attributes.created = moment.utc().format(config.MOMENT_DATE_TIME_FORMAT);
        var validate = Joi.object().keys({            
            "category_id":Joi.any(),
            "subcategory_id": Joi.any(),
            "status":Joi.any(),
            "created_at": Joi.date(),
            "updated_at":Joi.date()
        });
        Joi.validate(self.attributes, validate, {
        }, (err, value) => {
            if (err) throw (err.details[0].message);
        });
    },

});

module.exports = bookshelf.model('cat_subcat_mapping', CatSubcatMappingModel);