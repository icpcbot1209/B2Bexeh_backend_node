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
var FeedbackModel = loader.loadModel('/feedback/models/feedback_models');
// var AddressModel = loader.loadModel('/address/models/address_models');
var jwt = require('jsonwebtoken');
// var MetricesSettingProviderModel = loader.loadModel('/metrices_setting_provider/models/metrices_setting_provider_model');
// var MetricesSettingModel = loader.loadModel('/metrices_setting/models/metrices_setting_model');
var constant = require('../../../../../utils/constants');
var common_query = require('../../../../../utils/commonQuery');
var Response = require('../../../../../utils/response');
const uuidv4 = require('uuid/v4');
var utility = require('../../../../../utils/utility');

module.exports = {
  savefeedback: savefeedback,
  getAllfeedbacks: getAllfeedbacks,
  editfeedback: editfeedback,
  deletefeedback: deletefeedback,
  getfeedback: getfeedback,
  statusChange: statusChange,
};
function editfeedback(req, res) {
  async function editfeedbackMethod() {
    var updatedata = {
      feedback_by_bidder: req.body.buyer_feedback ? req.body.buyer_feedback : null,
      feedback_by_seller: req.body.seller_feedback ? req.body.seller_feedback : null,
    };
    let condition = {
      id: req.body.id,
    };
    try {
      let updateUserData = await common_query.updateRecord(FeedbackModel, updatedata, condition);
      if (updateUserData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }

  editfeedbackMethod().then((data) => {});
}
function statusChange(req, res) {
  async function statusChangeMethod() {
    var updatedata = {
      status: req.body.status ? req.body.status : null,
    };
    let condition = {
      id: req.body.id,
    };
    try {
      let updateUserData = await common_query.updateRecord(FeedbackModel, updatedata, condition);
      if (updateUserData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }

  statusChangeMethod().then((data) => {});
}

function deletefeedback(req, res) {
  async function deletefeedbackMethod() {
    let updatedata = {
      isdeleted: true,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(FeedbackModel, updatedata, condition);
    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.DeleteSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  deletefeedbackMethod().then((data) => {});
}

function savefeedback(req, res) {
  async function savefeedbackMethod() {
    console.log(req.body);
    const io = req.app.get('io');
    const { bid_and_ask_id, counters_id, feedback_by_seller, feedback_by_bidder, createdbyId, createdForId } = req.body;
    //     const roomid = await bookshelf.knex.raw(`select
    //     "id" from rooms where ("user_id1"= '${req.body.createdForId}' and "user_id2"=
    //     '${req.body.createdbyId}') or
    //     ("user_id2"= '${req.body.createdForId}' and "user_id1"= '${req.body.createdbyId}');`);

    //  if (roomid.rowCount) {
    //    console.log('inRoom.rows[0].id', roomid.rows[0].id)

    //     socket.broadcast.to(roomid.rows[0].id).emit('recievePendingInOfferSection', {
    //       data:'callpending',
    //     });

    //  }
    let isDuplictate = false;
    let condition = `select * from feedbacks where "counters_id"='${counters_id}' and isdeleted = false;`;
    // let condition = {
    //     bid_and_ask_id: req.body.bid_and_ask_id,
    //     counters_id:req.body.counters_id,
    //     feedback:req.body.feedback,
    //     status:req.body.status

    // }
    let checkDuplicate = await bookshelf.knex.raw(condition);
    if (checkDuplicate.rowCount > 0) {
      isDuplictate = true;
      let updatedata = {};
      if (feedback_by_bidder) {
        updatedata = {
          feedback_by_bidder: feedback_by_bidder ? feedback_by_bidder : null,
        };
      } else {
        updatedata = {
          feedback_by_seller: feedback_by_seller ? feedback_by_seller : null,
        };
      }

      let condition = {
        counters_id: counters_id,
      };
      let updateUserData = await common_query.updateRecord(FeedbackModel, updatedata, condition);
      let notObj = {
        created_by: createdbyId,
        content: 'added feedback for your offer',
        destnation_user_id: createdForId,
      };
      utility.addNotification(notObj, function (err, resp) {
        if (err) {
          console.log('Error adding notification in feedback offer', err);
        } else {
          console.log('response after calling common add notification in feedback offer', resp);
        }
      });
      if (updateUserData.code == 200) {
        /**
         * get the room
         */

        return res.json(Response(constant.statusCode.ok, constant.messages.feedbackSaveSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
      }
      // return res.json(Response(constant.statusCode.alreadyExist, 'feedbacks plan is already present, choose another feedbacks'));
    }
    if (!isDuplictate) {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      console.log(req.user._id);
      newdate = year + '-' + month + '-' + day;
      let data = {
        bid_and_ask_id: bid_and_ask_id ? bid_and_ask_id : null,
        counters_id: counters_id ? counters_id : null,
        // status: status ? status : null,
        feedback_by_seller: feedback_by_seller ? feedback_by_seller : undefined,
        feedback_by_bidder: feedback_by_bidder ? feedback_by_bidder : undefined,
        // created_at: newdate,
        // isdeleted: false
      };

      let savefeedbackData = await common_query.saveRecord(FeedbackModel, data);
      let notObj = {
        created_by: createdbyId,
        content: 'added feedback for your offer',
        destnation_user_id: createdForId,
      };
      utility.addNotification(notObj, function (err, resp) {
        if (err) {
          console.log('Error adding notification in feedback offer', err);
        } else {
          console.log('response after calling common add notification in feedback offer', resp);
        }
      });
      //   console.log(savefeedbackData);
      if (savefeedbackData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.feedbackSaveSuccess, savefeedbackData));
      } else if (savefeedbackData.code == 409) {
        //  console.log("savefeedbackData===>in else");

        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.feedbackAlreadyExist));
      }
    }
  }
  savefeedbackMethod().then((data) => {});
}

function getAllfeedbacks(req, res) {
  async function getAllfeedbacksMethod() {
    try {
      let limit = req.body.pagePerLimit || 10;
      let page = req.body.currentPage - 1 || 0;
      let isdeleted = req.body.isdeleted || false;
      let offset = limit * page;
      let columnName = req.body.columnName || 'id';
      let sortingOrder = req.body.sortingOrder || 'ASC';
      let searchChar;
      if (req.body.searchChar) {
        searchChar = `"feedbacks" ilike '%${req.body.searchChar}%' and `;
      }
      let sql = `select count(*) OVER() AS full_count,F.counters_id ,F.feedback_by_bidder ,F.feedback_by_seller ,F.status,S."first_name" as "sellerFirstName",S."last_name"  as "sellerLastName" ,B."first_name" as "bidderFirstName",B."last_name"  as "bidderLastName"
      ,C."qty",C."amount",C."total_amount",P."productName" ,I."imageUrl" ,C."type_of",F.id,C.created_at
      from feedbacks F
      LEFT OUTER JOIN counters C ON C.id = F."counters_id"
      LEFT OUTER JOIN users S ON S.id = C."seller_id"
      LEFT OUTER JOIN users B ON B.id = C."bidder_id"
      LEFT OUTER JOIN products P ON P.id = C."product_id"
      LEFT OUTER JOIN images  I ON I."productId" = C."product_id"
WHERE ${searchChar ? searchChar : ''}F.isdeleted=? ORDER BY F."${columnName}" ${sortingOrder} OFFSET ? LIMIT ?;`;
      bookshelf.knex
        .raw(sql, [isdeleted, offset, limit])
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.feedbackFetchedSuccessfully, data));
        })
        .catch(
          (err) => console.log('Error at feedback listing', err)
          // res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound))
        );
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getAllfeedbacksMethod().then((data) => {});
}

function getfeedback(req, res) {
  async function getfeedbackMethod() {
    try {
      let isdeleted = req.body.isdeleted || false;
      let sql = `select * from feedbacks where "id"= ${req.params.id} and "isdeleted"=false;`;
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
  getfeedbackMethod().then((data) => {});
}
