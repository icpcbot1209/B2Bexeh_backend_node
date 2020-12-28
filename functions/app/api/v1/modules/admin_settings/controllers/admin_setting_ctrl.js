
var bookshelf = __rootRequire('app/config/bookshelf');
var config = __rootRequire('app/config/constant');
var Joi = require('joi');
var moment = require('moment');
var crypto = __rootRequire('app/utils/crypto');
var loader = __rootRequire('app/api/v1/loader');
var santize = __rootRequire('app/utils/santize');
var i18n = require("i18n");
var _ = require("lodash");
var __ = require('underscore');
var text = __rootRequire('app/utils/text');
var async = require('async');
var bidsasksModel = loader.loadModel('/bidsAsks/models/bidsasks_models');
var UserModel = loader.loadModel('/user/models/user_models');
var imageModel = loader.loadModel('/images/models/image_models');
var settingModel = require('../models/admin_setting_models');
var common_query = require('../../../../../utils/commonQuery');
var Response = require('../../../../../utils/response');
var constant = require('../../../../../utils/constants');
const uuidv4 = require('uuid/v4');
module.exports = {
    changeSubscriptionStatus,
    updateEmailStatus,
    updateSmtpStatus,
    updatePaypalStatus,
    updateCartStatus,
    updateContactStatus,
    getsettingStatus
}

function changeSubscriptionStatus(req, res) {
    async function async_fun() {
        try {

            let updatedata = {
                // updatedAt: `${moment().utc().format('YYYY-MM-DD')}`,
                is_subscription_enabled: req.body.status,
                createdAt: `${moment().utc().format('YYYY-MM-DD')}`
            }
            let condition = {
                is_subscription_enabled: !req.body.status

            }
            console.log(updatedata, 'updatedata', 'condition', condition)
            let updateSettingData = await common_query.updateRecord(settingModel, updatedata, condition);
            if(updateSettingData.code==200){
                return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess,{}))
            }else{
                return res.json(Response(constant.statusCode.internalservererror,
                    constant.validateMsg.internalError, {}));
            }

        } catch (error) {
            return res.json(Response(constant.statusCode.internalservererror,
                constant.validateMsg.internalError, {}));

        }
    } async_fun()
}

function updateEmailStatus(req, res) {
    async function async_fun() {
        try {
            let updatedata = {
                updatedAt: `${moment().utc().format('YYYY-MM-DD')}`,
                settingname: 'emailsetting',
                settingvalue: req.body.settingvalue,
                isdeleted: false
            }
            let condition = {
                id: req.body.id
            }
           
            let updateEmailData = await common_query.updateRecord(settingModel, updatedata, condition);
            if(updateEmailData.code==200){
                return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess,updateEmailData))
            }else{
                return res.json(Response(constant.statusCode.internalservererror,
                    constant.validateMsg.internalError, {}));
            }

        } catch (error) {
            return res.json(Response(constant.statusCode.internalservererror,
                constant.validateMsg.internalError, {}));

        }
    } async_fun()
}


function updateSmtpStatus(req, res) {
    async function async_fun() {
        try {
            let updatedata = {
                updatedAt: `${moment().utc().format('YYYY-MM-DD')}`,
                settingname: 'smtpsetting',
                settingvalue: req.body.settingvalue,
                isdeleted: false
            }
            let condition = {
                id: req.body.id
            }
           
            let updatesmtpData = await common_query.updateRecord(settingModel, updatedata, condition);
            if(updatesmtpData.code==200){
                return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess,updatesmtpData))
            }else{
                return res.json(Response(constant.statusCode.internalservererror,
                    constant.validateMsg.internalError, {}));
            }

        } catch (error) {
            return res.json(Response(constant.statusCode.internalservererror,
                constant.validateMsg.internalError, {}));

        }
    } async_fun()
}


function updatePaypalStatus(req, res) {
    async function async_fun() {
        try {
            let updatedata = {
                updatedAt: `${moment().utc().format('YYYY-MM-DD')}`,
                settingname: 'paypalsetting',
                settingvalue: req.body.settingvalue,
                isdeleted: false
            }
            let condition = {
                id: req.body.id
            }
           
            let updatePaypalData = await common_query.updateRecord(settingModel, updatedata, condition);
            if(updatePaypalData.code==200){
                return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess,updatePaypalData))
            }else{
                return res.json(Response(constant.statusCode.internalservererror,
                    constant.validateMsg.internalError, {}));
            }

        } catch (error) {
            return res.json(Response(constant.statusCode.internalservererror,
                constant.validateMsg.internalError, {}));

        }
    } async_fun()
}

function updateCartStatus(req, res) {
    async function async_fun() {
        try {
            let updatedata = {
                updatedAt: `${moment().utc().format('YYYY-MM-DD')}`,
                settingname: 'cartsetting',
                settingvalue: req.body.settingvalue,
                isdeleted: false
            }
            let condition = {
                id: req.body.id
            }
           
            let updateCartData = await common_query.updateRecord(settingModel, updatedata, condition);
            if(updateCartData.code==200){
                return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess,updateCartData))
            }else{
                return res.json(Response(constant.statusCode.internalservererror,
                    constant.validateMsg.internalError, {}));
            }

        } catch (error) {
            return res.json(Response(constant.statusCode.internalservererror,
                constant.validateMsg.internalError, {}));

        }
    } async_fun()
}

function updateContactStatus(req, res) {
    async function async_fun() {
        try {
            let updatedata = {
                updatedAt: `${moment().utc().format('YYYY-MM-DD')}`,
                settingname: 'contactsetting',
                settingvalue: req.body.settingvalue,
                isdeleted: false
            }
            let condition = {
                id: req.body.id
            }
           
            let updateContactData = await common_query.updateRecord(settingModel, updatedata, condition);
            if(updateContactData.code==200){
                return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess,updateContactData))
            }else{
                return res.json(Response(constant.statusCode.internalservererror,
                    constant.validateMsg.internalError, {}));
            }

        } catch (error) {
            return res.json(Response(constant.statusCode.internalservererror,
                constant.validateMsg.internalError, {}));

        }
    } async_fun()
}

function getsettingStatus(req, res) {
    async function async_fun() {
        try {
            const condition = {
                isdeleted: false
            }
            const getStatus = await common_query.findAllData(settingModel, condition)
            let finalData = getStatus.data.toJSON()
            if (getStatus.code == 200) {
                return res.json(Response(constant.statusCode.ok, constant.messages.DeleteSuccess,
                    finalData));
            } else {
                return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, {}));
            }
        } catch (error) {
            return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, {}));

        }
    } async_fun()
}