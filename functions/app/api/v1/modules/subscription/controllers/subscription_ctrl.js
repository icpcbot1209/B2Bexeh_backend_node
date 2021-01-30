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
var SubscriptionModel = loader.loadModel('/subscription/models/subscription_models');
// var AddressModel = loader.loadModel('/address/models/address_models');
var jwt = require('jsonwebtoken');
// var MetricesSettingProviderModel = loader.loadModel('/metrices_setting_provider/models/metrices_setting_provider_model');
// var MetricesSettingModel = loader.loadModel('/metrices_setting/models/metrices_setting_model');
var constant = require('../../../../../utils/constants');
var common_query = require('../../../../../utils/commonQuery');
var Response = require('../../../../../utils/response');
const uuidv4 = require('uuid/v4');

module.exports = {
  savesubscription: savesubscription,
  getAllsubscriptions: getAllsubscriptions,
  editsubscription: editsubscription,
  deletesubscription: deletesubscription,
  getsubscription: getsubscription,
};
function editsubscription(req, res) {
  async function editsubscriptionMethod() {
    var updatedata = {
      plan_name: req.body.plan_name ? req.body.plan_name : null,
      amount: req.body.amount ? req.body.amount : null,
      status: req.body.status ? req.body.status : null,
    };
    let condition = {
      id: req.body.id,
    };
    try {
      let updateUserData = await common_query.updateRecord(SubscriptionModel, updatedata, condition);
      if (updateUserData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }

  editsubscriptionMethod().then((data) => {});
}
function deletesubscription(req, res) {
  async function deletesubscriptionMethod() {
    let updatedata = {
      isdeleted: true,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(SubscriptionModel, updatedata, condition);
    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.DeleteSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  deletesubscriptionMethod().then((data) => {});
}

function savesubscription(req, res) {
  async function savesubscriptionMethod() {
    console.log(req.body);
    const {
      plan_name,
      amount,
      //status
    } = req.body;

    let isDuplictate = false;
    let condition = `select * from subscriptions where "plan_name" ilike '${plan_name}' and isdeleted = false;`;
    let checkDuplicate = await bookshelf.knex.raw(condition);
    if (checkDuplicate.rowCount > 0) {
      isDuplictate = true;
      return res.json(Response(constant.statusCode.alreadyExist, 'subscriptions plan is already present, choose another subscriptions'));
    }
    if (!isDuplictate) {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      console.log(req.user._id);
      newdate = year + '-' + month + '-' + day;
      let data = {
        plan_name: plan_name ? plan_name : null,
        amount: amount ? amount : null,
        //status: status ? status : null,
        created_at: newdate,
        isdeleted: false,
      };

      let savesubscriptionData = await common_query.saveRecord(SubscriptionModel, data);
      //   console.log(savesubscriptionData);
      if (savesubscriptionData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.subscriptioncreatedSuccessfully, savesubscriptionData));
      } else if (savesubscriptionData.code == 409) {
        //  console.log("savesubscriptionData===>in else");

        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.subscriptionAlreadyExist));
      }
    }
  }
  savesubscriptionMethod().then((data) => {});
}

function getAllsubscriptions(req, res) {
  async function getAllsubscriptionsMethod() {
    try {
      let limit = req.body.pagePerLimit || 10;
      let page = req.body.currentPage - 1 || 0;
      let isdeleted = req.body.isdeleted || false;
      let offset = limit * page;
      let columnName = req.body.columnName || 'id';
      let sortingOrder = req.body.sortingOrder || 'ASC';
      let searchChar;
      if (req.body.searchChar) {
        searchChar = `"subscriptions" ilike '%${req.body.searchChar}%' and `;
      }
      let sql = `SELECT *, count(*) OVER() AS full_count FROM subscriptions WHERE ${
        searchChar ? searchChar : ''
      }isdeleted=? ORDER BY "${columnName}" ${sortingOrder} OFFSET ? LIMIT ?;`;
      bookshelf.knex
        .raw(sql, [isdeleted, offset, limit])
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.subscriptionFetchedSuccessfully, data));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getAllsubscriptionsMethod().then((data) => {});
}

function getsubscription(req, res) {
  async function getsubscriptionMethod() {
    try {
      let isdeleted = req.body.isdeleted || false;
      let sql = `select * from subscriptions where "id"= ${req.params.id} and "isdeleted"=false;`;
      bookshelf.knex
        .raw(sql)
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, data.rows[0]));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getsubscriptionMethod().then((data) => {});
}
