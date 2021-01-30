var bookshelf = require('app/config/bookshelf');
var config = require('app/config/constant');
var Joi = require('joi');
var moment = require('moment');
var crypto = require('app/utils/crypto');
var loader = require('app/api/v1/loader');
var santize = require('app/utils/santize');
var i18n = require('i18n');
var _ = require('lodash');
var __ = require('underscore');
var text = require('app/utils/text');
var async = require('async');
var CategoryModel = loader.loadModel('/category/models/category_models');
// var AddressModel = loader.loadModel('/address/models/address_models');
var jwt = require('jsonwebtoken');
// var MetricesSettingProviderModel = loader.loadModel('/metrices_setting_provider/models/metrices_setting_provider_model');
// var MetricesSettingModel = loader.loadModel('/metrices_setting/models/metrices_setting_model');
var constant = require('../../../../../utils/constants');
var common_query = require('../../../../../utils/commonQuery');
var Response = require('../../../../../utils/response');
const uuidv4 = require('uuid/v4');

module.exports = {
  saveCategory: saveCategory,
  getAllCategorys: getAllCategorys,
};

function updateUserData(req, res) {
  async function updateuserdataMethod() {
    console.log(req.bodegistey);

    let updatedata = {
      username: req.body.username,
      password: req.body.password,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(UserModel, updatedata, condition);
    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  updateuserdataMethod().then((data) => {});
}

function saveCategory(req, res) {
  async function saveCategoryMethod() {
    console.log(req.body);

    const { categoryName, createdById } = req.body;
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    newdate = year + '-' + month + '-' + day;
    let data = {
      categoryName: categoryName ? categoryName : null,
      createdById: createdById ? createdById : 7,
      createdAt: newdate,
      category_id: uuidv4(),
    };

    let saveCategoryData = await common_query.saveRecord(CategoryModel, data);
    //   console.log(saveUserData);
    if (saveCategoryData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.recordUploadedSucess, saveCategoryData));
    } else if (saveCategoryData.code == 409) {
      //  console.log("saveCategoryData===>in else");

      return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
    }
  }
  saveCategoryMethod().then((data) => {});
}

function getAllCategorys(req, res) {
  async function getAllCategorysMethod() {
    console.log(req.body);
    let condition = {};
    let getCategoryData = await common_query.findAllData(CategoryModel, condition);
    //   console.log(saveUserData);
    if (getCategoryData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, getCategoryData));
    } else if (getCategoryData.code == 409) {
      console.log('getCategoryData===>in else');

      return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
    }
  }
  getAllCategorysMethod().then((data) => {});
}
