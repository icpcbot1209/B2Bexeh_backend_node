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
var UserModel = loader.loadModel('/user/models/user_models');
var TxnHistoryModel = loader.loadModel('/user/models/transaction_history_model');
var NotificationModel = loader.loadModel('/user/models/notification_models');
var OrderModel = loader.loadModel('/user/models/order_models');
var EmailBlastModel = loader.loadModel('/user/models/emailblast_models');
var CounterModel = loader.loadModel('/product/models/counteroffer_models');
var WatchListModel = loader.loadModel('/user/models/watchlist_models');
var imageModel = loader.loadModel('/images/models/image_models');
var settingModel = require('../../admin_settings/models/admin_setting_models');
var ChatModel = require('../../chat/models/chat_models');
var roomModel = require('../../bidsAsks/models/room_models');
var contactModel = require('../../bidsAsks/models/contact_models');
var mkdirp = require('mkdirp');
var config1 = require('app/config/config').get('local');
var s3file_upload = require('../../../../../utils/fileUpload');
// var AddressModel = loader.loadModel('/address/models/address_models');
var jwt = require('jsonwebtoken');
// var MetricesSettingProviderModel = loader.loadModel('/metrices_setting_provider/models/metrices_setting_provider_model');
// var MetricesSettingModel = loader.loadModel('/metrices_setting/models/metrices_setting_model');
var constant = require('../../../../../utils/constants');
var common_query = require('../../../../../utils/commonQuery');
var Response = require('../../../../../utils/response');
const uuidv4 = require('uuid/v4');
var utility = require('../../../../../utils/utility');
const nodemailer = require('nodemailer');
module.exports = {
  updateUserData: updateUserData,
  saveUser: saveUser,
  login: login,
  test: test,
  forgotPassword: forgotPassword,
  resetpassword: resetpassword,
  getLastThreeTransaction: getLastThreeTransaction,
  getTxnHistory: getTxnHistory,
  getTransactionList: getTransactionList,
  editProfil: editProfil,
  uplodeProfileImage: uplodeProfileImage,
  getAllUsers: getAllUsers,
  userdetails: userdetails,
  editUser: editUser,
  deleteUser: deleteUser,
  // emailVerification: emailVerification,

  login2: login2,
  getUser: getUser,
  acceptOffer: acceptOffer,
  cancelOffer: cancelOffer,
  saveTxnHistory: saveTxnHistory,
  getSentAcceptOfferByUserId: getSentAcceptOfferByUserId,
  addTrackNo: addTrackNo,
  confirmDelivery: confirmDelivery,
  addPaymentDetail: addPaymentDetail,
  declineOffer: declineOffer,
  getOfferById: getOfferById,
  AddWatchList: AddWatchList,
  updateprofile: updateprofile,
  getWatchListData: getWatchListData,
  getAllWatchListData: getAllWatchListData,
  getActiveOfferByUserId,
  getActiveRecievedByUserId,
  getAcceptOfferByUserId,
  statusChange,
  sendContactUs,
  getPendingOfferByUserId,
  getAllAdminUsers: getAllAdminUsers,
  deleteOffer: deleteOffer,
  deleteAllOffer: deleteAllOffer,
  saveEmailBlast: saveEmailBlast,
  addNotification: addNotification,
  getNotificationByUserId: getNotificationByUserId,
  readNotification: readNotification,
  exportTransactionList: exportTransactionList,
  getEmailBlastUser: getEmailBlastUser,
  deleteNotification: deleteNotification,
};

function statusChange(req, res) {
  async function statusChangeMethod() {
    var updatedata = {
      is_active: req.body.is_active ? req.body.is_active : null,
    };
    let condition = {
      id: req.body.id,
    };
    try {
      let updateUserData = await common_query.updateRecord(UserModel, updatedata, condition);
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

function getLastThreeTransaction(req, res) {
  async function getLastThreeTransactionMethod() {
    try {
      let sql;
      if (req.body && req.body.limit) {
        sql = `Select O.id, O."created_at",C."type_of",C."type", C."amount", C."qty", P."productName"
        from orders O
        LEFT OUTER JOIN counters C ON O."counter_id" = C.id
        LEFT OUTER JOIN products P ON O."product_id" = P.id
        where O.is_deleted = false and O.product_id =${req.body.product_id} and O."status" LIKE '%accept%' and O."track_no" is not NULL and O.delivered = true
        Group By O.id, C."type_of", C."total_amount", C."amount",C."qty", P."productName", C."type"
        order by id desc limit ${req.body.limit}`;
      } else {
        sql = `Select O.id, O."created_at",C."type_of",C."type", C."amount", C."qty", P."productName"
        from orders O
        LEFT OUTER JOIN counters C ON O."counter_id" = C.id
        LEFT OUTER JOIN products P ON O."product_id" = P.id
        where O.is_deleted = false and O.product_id =${req.body.product_id} and O."status" LIKE '%accept%' and O."track_no" is not NULL and O.delivered = true
        Group By O.id, C."type_of", C."total_amount", C."amount",C."qty", P."productName", C."type"
        order by O."created_at" desc`;
      }

      bookshelf.knex
        .raw(sql)
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, data.rows));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getLastThreeTransactionMethod().then((data) => {});
}

// function getTxnHistory(req, res) {
//   async function getTxnHistoryMethod() {
//     try {
//       let result = {
//         total_txn_lifetime: '',
//         total_txn_ninty_days: '',
//         total_txn_six_month: '',
//         total_txn_lifetime_count: ''
//       };
//       let sql = `select * from transaction_history where "userId"= ${req.body.userId} and "is_deleted"=false;`

//       await bookshelf.knex.raw(sql).then(data => {
//         result.total_txn_lifetime = data.rows.length ? data.rows[0].total_txn_lifetime : 0;

//       }).catch(err =>
//         console.log("Error1===", err));
//       let sql1 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.bidder_id =${req.body.userId}
//       and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL '90 days' and  o.paymentdetail!=null;`
//       await bookshelf.knex.raw(sql1).then(data => {
//         result.total_txn_ninty_days = data.rows.length;
//         console.log("3 months data", data.rows)
//       }).catch(err =>
//         console.log("Error2===", err));
//         let sql11 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.seller_id =${req.body.userId}
//         and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL '90 days' and  o."track_no"!=null`
//         await bookshelf.knex.raw(sql11).then(data => {
//           result.total_txn_ninty_days = data.rows.length;
//           console.log("3 months data", data.rows)
//         }).catch(err =>
//           console.log("Error2===", err));

//       let sql2 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.bidder_id =${req.body.userId}
//       and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL '180 days';`
//       await bookshelf.knex.raw(sql2).then(data => {
//         result.total_txn_six_month = data.rows.length;
//       }).catch(err =>
//         console.log("Error3===", err));
//       let sql3 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.bidder_id =${req.body.userId} and C."is_deleted"=false;`
//       await bookshelf.knex.raw(sql3).then(data => {
//         result.total_txn_lifetime_count = data.rows.length;
//       }).catch(err =>
//         console.log("Error4===", err));

//       return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, result));

//     }
//     catch (err) {
//       return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
//     }
//   }
//   getTxnHistoryMethod().then((data) => {
//   })
// }

function getTxnHistory(req, res) {
  async function getTxnHistoryMethod() {
    try {
      let result = {
        total_txn_lifetime: '',
        total_txn_ninty_days: '',
        total_txn_ninty_days1: '',
        total_txn_ninty_days2: '',
        total_txn_six_month: '',
        total_txn_six_month1: '',
        total_txn_six_month2: '',
        total_txn_lifetime_count: '',
        total_txn_lifetime_count1: '',
        total_txn_lifetime_count2: '',
        txnHistoryTotal: '',
      };
      let sql = `select * from transaction_history where "userId"= ${req.body.userId} and "is_deleted"=false;`;

      await bookshelf.knex
        .raw(sql)
        .then((data) => {
          result.total_txn_lifetime = data.rows.length ? data.rows[0].total_txn_lifetime : 0;
        })
        .catch((err) => console.log('Error1===', err));
      let sql1 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.bidder_id =${req.body.userId}
  and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL '90 days' and o."paymentdetail" is not NULL;`;
      await bookshelf.knex
        .raw(sql1)
        .then((data) => {
          result.total_txn_ninty_days1 = data.rows.length;
          console.log('3 months data 1', data.rows.length);
        })
        .catch((err) => console.log('Error2===', err));
      let sql11 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.seller_id =${req.body.userId}
  and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL '90 days' and o."track_no" is not NULL;`;
      await bookshelf.knex
        .raw(sql11)
        .then((data) => {
          result.total_txn_ninty_days2 = data.rows.length;
          result.total_txn_ninty_days = result.total_txn_ninty_days1 + result.total_txn_ninty_days2;

          console.log('3 months data 2', result.total_txn_ninty_days);
        })
        .catch((err) => console.log('Error2===', err));

      let sql2 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.bidder_id =${req.body.userId}
  and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL '180 days' and o."paymentdetail" is not NULL;`;
      await bookshelf.knex
        .raw(sql2)
        .then((data) => {
          result.total_txn_six_month1 = data.rows.length;
        })
        .catch((err) => console.log('Error3===', err));

      let sql21 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.seller_id =${req.body.userId}
          and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL '180 days' and o."track_no" is not NULL;`;
      await bookshelf.knex
        .raw(sql21)
        .then((data) => {
          result.total_txn_six_month2 = data.rows.length;
          result.total_txn_six_month = result.total_txn_six_month1 + result.total_txn_six_month2;
        })
        .catch((err) => console.log('Error3===', err));
      let sql3 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.bidder_id =${req.body.userId}
          and C."is_deleted"=false  and o."paymentdetail" is not NULL;`;
      await bookshelf.knex
        .raw(sql3)
        .then((data) => {
          result.total_txn_lifetime_count1 = data.rows.length;
        })
        .catch((err) => console.log('Error4===', err));
      let sql31 = `select * from orders o left outer join counters C on c.id =o.counter_id where C.seller_id =${req.body.userId}
          and C."is_deleted"=false and o."track_no" is not NULL; `;
      await bookshelf.knex
        .raw(sql31)
        .then((data) => {
          result.total_txn_lifetime_count2 = data.rows.length;
          result.total_txn_lifetime_count = result.total_txn_lifetime_count1 + result.total_txn_lifetime_count2;
        })
        .catch((err) => console.log('Error4===', err));
      console.log('resultttttttttttttttttttt', result);
      return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, result));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getTxnHistoryMethod().then((data) => {});
}

function saveTxnHistory(req, res) {
  async function saveTxnHistoryMethod() {
    try {
      let sql = `select * from transaction_history where "userId"=${req.body.userId} and "is_deleted"=false;`;
      let TxnHistoryData = await bookshelf.knex.raw(sql);
      let array1 = TxnHistoryData.rows;
      var txnHistoryRecord = [];
      array1.forEach((element) => {
        let output = JSON.stringify(element);
        let output1 = JSON.parse(output);
        txnHistoryRecord.push(output1);
      });

      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      newdate = year + '-' + month + '-' + day;

      if (TxnHistoryData.rowCount > 0) {
        let updatedata = {
          total_txn_lifetime: req.body.total_txn_lifetime ? req.body.total_txn_lifetime : null,
          userId: req.body.userId ? req.body.userId : null,
          is_deleted: false,
          updatedAt: newdate,
        };
        // total_txn_six_month: req.body.total_txn_six_month ? req.body.total_txn_six_month : null,
        // total_txn_ninty_days: req.body.total_txn_ninty_days ? req.body.total_txn_ninty_days : null,
        // expire_offer: req.body.expire_offer ? req.body.expire_offer : null,
        // offer_acceptance: req.body.offer_acceptance ? req.body.offer_acceptance : null,

        let condition = {
          id: txnHistoryRecord[0].id,
        };

        let updateTxnHistoryData = await common_query.updateRecord(TxnHistoryModel, updatedata, condition);
        if (updateTxnHistoryData.code == 200) {
          return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateTxnHistoryData.success));
        } else {
          return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
        }
      } else {
        let data = {
          total_txn_lifetime: req.body.total_txn_lifetime ? req.body.total_txn_lifetime : null,
          userId: req.body.userId ? req.body.userId : null,
          is_deleted: false,
          createdAt: newdate,
          updatedAt: newdate,
        };

        let updateUserData = await common_query.saveRecord(TxnHistoryModel, data);
        if (updateUserData.code == 200) {
          return res.json(Response(constant.statusCode.ok, constant.messages.TxnsubmittedSuccessfully, updateUserData));
        } else {
          return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
        }
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  saveTxnHistoryMethod().then((data) => {});
}

function saveEmailBlast(req, res) {
  async function saveEmailBlastUserMethod() {
    try {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      newdate = year + '-' + month + '-' + day;
      var roomId;
      let data = {
        is_deleted: false,
        subject: req.body.subject ? req.body.subject : null,
        message: req.body.message ? req.body.message : null,
        user: req.body.user ? req.body.user : null,
        createdBy: req.body.userId ? req.body.userId : null,
        createdAt: newdate,
      };

      let updateUserData = await common_query.saveRecord(EmailBlastModel, data);
      if (updateUserData.code == 200) {
        req.body.user.forEach(async (element) => {
          if (element.id != req.body.userId) {
            let notObj = {
              created_by: req.body.userId,
              content: 'Email blast:' + ' ' + req.body.subject,
              destnation_user_id: element.id,
            };
            utility.addNotification(notObj, function (err, resp) {
              if (err) {
                console.log('Error adding notification in Email blast', err);
              } else {
                console.log('response after calling common add notification in Email blast', resp);
              }
            });

            let data = {
              user_id1: req.body.userId,
              user_id2: element.id,
              status: true,
              created_at: `${moment().utc().format('YYYY-MM-DD')}`,
              updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
            };

            let inRoom = await bookshelf.knex.raw(`select
"id" from rooms where ("user_id1"= '${req.body.userId}' and "user_id2"= '${element.id}') or
("user_id2"= '${req.body.userId}' and "user_id1"= '${element.id}');`);

            if (inRoom.rowCount) {
              console.log('2');
              let rmCondition = {
                id: inRoom.rows[0].id,
              };

              roomId = inRoom.rows[0].id;
              const update_rm = {
                status: true,
                updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
              };
              await common_query.updateRecord(roomModel, update_rm, rmCondition).catch((err) => {
                throw err;
              });

              const contact_chat_condition = {
                room_id: inRoom.rows[0].id,
                my_id: req.body.userId,
                my_contact_id: element.id,
              };
              console.log('data contact_chat_condition id in line number 312', contact_chat_condition);

              let contactInfo = await common_query.findAllData(contactModel, contact_chat_condition).catch((err) => {
                throw err;
              });
              console.log('data contact id in line number 317', contactInfo.data.toJSON());

              if (contactInfo.data.toJSON().length) {
                contactInfo = contactInfo.data.toJSON();
                contact_id_for_chat = contactInfo[0].id;
                console.log('data contact id in line number 318', contact_id_for_chat);
              } else {
                let data = {
                  my_id: req.body.userId,
                  my_contact_id: element.id,
                  isblocked: false,
                  created_at: `${moment().utc().format('YYYY-MM-DD')}`,
                  updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
                  room_id: inRoom.rows[0].id,
                };
                await common_query
                  .saveRecord(contactModel, data)
                  .catch((err) => {
                    throw err;
                  })
                  .then(async (data) => {
                    console.log('datata in line number 335');
                    const contact_chat_condition = {
                      room_id: inRoom.rows[0].id,
                      my_id: req.body.userId,
                      my_contact_id: element.id,
                    };
                    console.log('datata in line number 343', contact_chat_condition);

                    let contactInfo = await common_query.findAllData(contactModel, contact_chat_condition).catch((err) => {
                      throw err;
                    });
                    console.log('datata in line number 349', contactInfo.data);

                    contactInfo = contactInfo.data.toJSON();
                    contact_id_for_chat = contactInfo[0].id;
                    console.log('data contact id in line number 348', contact_id_for_chat);
                  });
              }
            } else {
              console.log('datadatadatadata', data);
              let saveRoom = await common_query.saveRecord(roomModel, data).catch((err) => {
                throw err;
              });
              console.log('saveRoomsaveRoom', saveRoom.success.toJSON());
              let resp = saveRoom.success.toJSON();
              if (saveRoom) {
                let data = {
                  my_id: req.body.userId,
                  my_contact_id: element.id,
                  isblocked: false,
                  created_at: `${moment().utc().format('YYYY-MM-DD')}`,
                  updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
                  room_id: resp.id,
                };
                roomId = resp.id;
                let c2 = await common_query
                  .saveRecord(contactModel, data)
                  .catch((err) => {
                    throw err;
                  })
                  .then(async (data) => {
                    console.log('datata in line number 335');
                    const contact_chat_condition = {
                      room_id: resp.id,
                      my_id: req.body.userId,
                      my_contact_id: element.id,
                    };

                    let contactInfo = await common_query.findAllData(contactModel, contact_chat_condition).catch((err) => {
                      throw err;
                    });
                    contactInfo = contactInfo.data.toJSON();
                    contact_id_for_chat = contactInfo[0].id;
                    console.log('data contact id in line number 348', contact_id_for_chat);
                  });
                let data1 = {
                  my_contact_id: req.body.userId,
                  my_id: element.id,
                  isblocked: false,
                  created_at: `${moment().utc().format('YYYY-MM-DD')}`,
                  updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
                  room_id: resp.id,
                };
                let c1 = await common_query.saveRecord(contactModel, data1).catch((err) => {
                  throw err;
                });
              } else {
                return res.json(Response(constant.statusCode.internalError, constant.messages.commonError, null));
              }
            }
            var message = {
              msg: {
                subject: req.body.subject,
                message: req.body.message,
              },
            };
            const chatData = {
              my_id: parseInt(req.body.userId),
              room_id: parseInt(roomId),
              contact_id: parseInt(element.id),
              message: message,
              type: 'email',
              date_to_group: `${moment().utc().format('YYYY-MM-DD')}`,
              created_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
              updated_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
              isdelete: false,
              isActionPerformedbySender: false,
              isActionPerformedbyRecieved: false,
              isofferAccepted: false,
              isofferCanceled: false,
              isofferExpired: false,
            };
            await common_query.saveRecord(ChatModel, chatData);
          }
        });
        return res.json(Response(constant.statusCode.ok, constant.messages.EmailBlastedSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  saveEmailBlastUserMethod().then((data) => {});
}

function sendContactUs(req, res) {
  async function sendContactUsMethod() {
    try {
      var cond = {
        isdeleted: false,
        settingname: 'emailsetting',
      };
      const getStatus = await common_query.findAllData(settingModel, cond);
      let finalData = getStatus.data.toJSON();
      if (getStatus.code == 200) {
        var admindata = finalData[0].settingvalue;
        var title = req.body.name + '- Contact Us Notification ';
        var sendData = {
          email: admindata.email,
          sendername: req.body.name,
          sendermessage: req.body.message,
          template: 'contact_us',
        };

        utility.readTemplateSendMailV2(admindata.email, title, sendData, 'contact_us', function (err, resp) {
          if (err) {
            console.log('Mail send error', err);
          } else if (resp) {
            console.log('Contact us success');
          }
        });

        return res.json(Response(constant.statusCode.ok, constant.messages.Submit, {}));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, {}));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  sendContactUsMethod().then((data) => {});
}
function getAcceptOfferByUserId(req, res) {
  async function getAcceptOfferByUserId() {
    try {
      let result = {
        acceptAsk: [],
        acceptBid: [],
      };
      let groupbyAsk = [];
      let groupbyBid = [];
      let groupbyAsksql = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id
      from counters where seller_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
      and type_of='ask' and expiry_date > now() AT TIME ZONE 'UTC'
      group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id ;`;
      await bookshelf.knex.raw(groupbyAsksql).then((data) => {
        groupbyAsk.push(data.rows);
      });
      let groupbyBidsql = `select created_at,product_id,expiry_day,seller_id,bid_and_ask_id
      from counters where bidder_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
      and type_of='bid' and expiry_date > now() AT TIME ZONE 'UTC'
      group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id ;`;
      await bookshelf.knex.raw(groupbyBidsql).then((data) => {
        groupbyBid.push(data.rows);
      });
      if (groupbyBid[0].length > 0) {
        for (let eachobj of groupbyBid[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlbid = `select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",
          s.user_name as sellerusername,b.user_name as bidderusername,
          s.first_name as sellerFirst,p."productName" as product_name,s.company_logo as companylogo,b.company_logo as b_companylogo,
                s.last_name as sellerLast,b.first_name as bidderFirst,b.last_name as bidderLast,O.id as order_id,O."status",O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c
                LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
                LEFT OUTER JOIN images i on i."productId" = c."product_id"
                LEFT OUTER JOIN users s on s.id = c."seller_id"
                LEFT OUTER JOIN users b on b.id = c."bidder_id"
                LEFT OUTER JOIN products p on p.id = c."product_id"
                LEFT OUTER JOIN orders O on c.id = O."counter_id"
                where c."created_at"='${create}' and c."seller_id"=${eachobj.seller_id} and c."expiry_day"=${eachobj.expiry_day}
                 and c."product_id"=${eachobj.product_id} and type_of='bid' and c.bidder_id=${req.body.loggedUser}
                 and c.type_of_offer='Accept' and c.is_deleted='false'
                 and c.type_of='bid' and c.expiry_date > now() AT TIME ZONE 'UTC'
                 and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlbid)
            .then((data) => {
              result.acceptBid.push(data);
            })
            .catch((err) => {
              console.log('err');
            });
        }
      }
      if (groupbyAsk[0].length > 0) {
        for (let eachobj of groupbyAsk[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlask = `select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",
          s.company_logo as companylogo,b.company_logo as b_companylogo,
          s.user_name as sellerusername,b.user_name as bidderusername,
          s.first_name as sellerFirst,p."productName" as product_name,
                s.last_name as sellerLast,b.first_name as bidderFirst,b.last_name as bidderLast,O.id as order_id,O."status",O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c
                LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
                LEFT OUTER JOIN images i on i."productId" = c."product_id"
                LEFT OUTER JOIN users s on s.id = c."seller_id"
                LEFT OUTER JOIN users b on b.id = c."bidder_id"
                LEFT OUTER JOIN products p on p.id = c."product_id"
                LEFT OUTER JOIN orders O on c.id = O."counter_id"
                where c."created_at"='${create}' and c."bidder_id"=${eachobj.bidder_id} and c."expiry_day"=${eachobj.expiry_day}
                 and c."product_id"=${eachobj.product_id} and c.seller_id=${req.body.loggedUser} and c.type_of_offer='Accept' and c.is_deleted='false'
                and c.type_of='ask' and c.expiry_date > now() AT TIME ZONE 'UTC'
                and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlask)
            .then((data) => {
              result.acceptAsk.push(data);
            })
            .catch((err) => {
              console.log('err');
            });
        }
      }
      var ask = result.acceptAsk;
      var bid = result.acceptBid;
      var temp = [];
      var temp1 = [];
      for (var i = 0; i < ask.length; i++) {
        for (var j = 0; j < ask[i].rows.length; j++) {
          temp.push(ask[i].rows[j]);
        }
      }
      for (var i = 0; i < bid.length; i++) {
        for (var j = 0; j < bid[i].rows.length; j++) {
          temp1.push(bid[i].rows[j]);
        }
      }
      result.acceptAsk = temp;
      result.acceptBid = temp1;
      return res.json(Response(constant.statusCode.ok, 'Active Offer fetched', result));
      // return res.json(Response(constant.statusCode.ok, "Active Offer fetched", result));
    } catch (err) {
      console.log('err in getAcceptOfferByUserId');
    }
  }
  getAcceptOfferByUserId().then((response) => {});
}
function getSentAcceptOfferByUserId(req, res) {
  async function getAcceptOfferByUserId() {
    try {
      let result = {
        acceptAsk: [],
        acceptBid: [],
      };
      let groupbyAsk = [];
      let groupbyBid = [];
      let groupbyAsksql = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id
  from counters where bidder_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
  and type_of='ask' and expiry_date > now() AT TIME ZONE 'UTC'
  group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id ;`;
      await bookshelf.knex.raw(groupbyAsksql).then((data) => {
        groupbyAsk.push(data.rows);
      });
      let groupbyBidsql = `select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id
  from counters where seller_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
  and type_of='bid' and expiry_date > now() AT TIME ZONE 'UTC'
  group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id ;`;
      await bookshelf.knex.raw(groupbyBidsql).then((data) => {
        groupbyBid.push(data.rows);
      });
      if (groupbyBid[0].length > 0) {
        for (let eachobj of groupbyBid[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlbid = `select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,
          a."producttype",s.user_name as sellerusername,s.first_name as sellerFirst,p."productName" as product_name,
  s.last_name as sellerLast,s.company_logo as companylogo,
  b.user_name as bidderusername,b.first_name as bidderFirst,b.last_name as bidderLast,
  b.company_logo as b_companylogo, O.id as order_id,O."status", O."delivered", O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c
  LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
  LEFT OUTER JOIN images i on i."productId" = c."product_id"
  LEFT OUTER JOIN users s on s.id = c."seller_id"
  LEFT OUTER JOIN users b on b.id = c."bidder_id"
  LEFT OUTER JOIN products p on p.id = c."product_id"
  LEFT OUTER JOIN orders O on c.id = O."counter_id"
  where c."created_at"='${create}' and c."seller_id"=${req.body.loggedUser} and c."expiry_day"=${eachobj.expiry_day}
  and c."product_id"=${eachobj.product_id} and type_of='bid' and c.bidder_id=${eachobj.bidder_id}
  and c.type_of_offer='Accept' and c.is_deleted='false' and (c.status!='decline' or c.status is null)
  and c.type_of='bid' and c.expiry_date > now() AT TIME ZONE 'UTC'
  and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlbid)
            .then((data) => {
              result.acceptBid.push(data);
            })
            .catch((err) => {
              console.log('err');
            });
        }
      }
      if (groupbyAsk[0].length > 0) {
        for (let eachobj of groupbyAsk[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlask = `select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",s.user_name as sellerusername,
          s.first_name as sellerFirst,p."productName" as product_name,
  s.last_name as sellerLast,b.user_name as bidderusername,s.company_logo as companylogo,
  b.first_name as bidderFirst,b.last_name as bidderLast, b.company_logo as b_companylogo,
  O.id as order_id,O."status",O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c
  LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
  LEFT OUTER JOIN images i on i."productId" = c."product_id"
  LEFT OUTER JOIN users s on s.id = c."seller_id"
  LEFT OUTER JOIN users b on b.id = c."bidder_id"
  LEFT OUTER JOIN products p on p.id = c."product_id"
  LEFT OUTER JOIN orders O on c.id = O."counter_id"
  where c."created_at"='${create}' and c."bidder_id"=${req.body.loggedUser} and c."expiry_day"=${eachobj.expiry_day}
  and c."product_id"=${eachobj.product_id} and c.seller_id=${eachobj.seller_id} and c.type_of_offer='Accept' and c.is_deleted='false'
  and c.type_of='ask' and c.expiry_date > now() AT TIME ZONE 'UTC'
  and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlask)
            .then((data) => {
              result.acceptAsk.push(data);
            })
            .catch((err) => {
              console.log('err');
            });
        }
      }
      var ask = result.acceptAsk;
      var bid = result.acceptBid;
      var temp = [];
      var temp1 = [];
      for (var i = 0; i < ask.length; i++) {
        for (var j = 0; j < ask[i].rows.length; j++) {
          temp.push(ask[i].rows[j]);
        }
      }
      for (var i = 0; i < bid.length; i++) {
        for (var j = 0; j < bid[i].rows.length; j++) {
          temp1.push(bid[i].rows[j]);
        }
      }
      result.acceptAsk = temp;
      result.acceptBid = temp1;

      return res.json(Response(constant.statusCode.ok, 'Active Offer fetched', result));
      // return res.json(Response(constant.statusCode.ok, "Active Offer fetched", result));
    } catch (err) {
      console.log('err in getAcceptOfferByUserId');
    }
  }
  getAcceptOfferByUserId().then((response) => {});
}
// function to get pending offers by saurabh 7-5-2020
// function getPendingOfferByUserId(req, res) {
//   async function getPendingOfferByUserId() {
//     try {
//       let result = {
//         selling: [],
//         buying: []
//       };
//       let groupbySelling = [];
//       let groupbyBuying = [];
//       // and type_of_offer='Accept'
//       // and type_of='bid'
//       //and type_of_offer='Accept'
//       //and type_of='bid'
//       console.log('userid is', req.body.loggedUser)
//       // const sData = await common_query.findAllData(CounterModel, { "id": 6318 })
//       // console.log('sDatatatatataat', sData.data.toJSON())
//       let groupbySellingsql = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status
//   from counters where seller_id=${req.body.loggedUser}
//   and is_deleted='false' and status='accept' group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status ;`
//       await bookshelf.knex.raw(groupbySellingsql).then(data => {
//         // console.log('selling query res----------------------', data.rows)
//         groupbySelling.push(data.rows)
//       });
//       let groupbyBuyingsql = `select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status
//   from counters where bidder_id=${req.body.loggedUser} and is_deleted='false' and status='accept'
//   group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status ;`
//       await bookshelf.knex.raw(groupbyBuyingsql).then(data => {
//         // console.log('buying query res-------------------', data.rows)
//         groupbyBuying.push(data.rows)
//       });

//       if (groupbyBuying[0].length > 0) {
//         for (let eachobj of groupbyBuying[0]) {
//           let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
//           sqlbid = `select c.*,i."imageUrl",sum(c."total_amount")
//   OVER() AS full_amount,a.type,a."producttype",s.user_name as sellerUserName,
//   s.company_logo as companylogo,s.first_name as sellerFirst,p."productName" as product_name,
//   s.last_name as sellerLast,b.user_name as bidderUserName,b.first_name as bidderFirst,
//   b.company_logo as b_companylogo,b.last_name as bidderLast,
//   O.id as order_id,O."status", O."delivered", O."createdbyId",
//   O."track_no",O."courier",O."paymentdetail",f."feedback_by_seller" as seller_feedback,
//   f."feedback_by_bidder" as bidder_feedback from counters c
//   LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
//   LEFT OUTER JOIN images i on i."productId" = c."product_id"
//   LEFT OUTER JOIN users s on s.id = c."seller_id"
//   LEFT OUTER JOIN users b on b.id = c."bidder_id"
//   LEFT OUTER JOIN products p on p.id = c."product_id"
//   LEFT OUTER JOIN orders O on c.id = O."counter_id"
//   LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"
//   where c."created_at"='${create}' and c."seller_id"=${eachobj.seller_id}
//   and c."expiry_day"=${eachobj.expiry_day}
//   and c."product_id"=${eachobj.product_id} and c.bidder_id=${eachobj.bidder_id}
//   and c.is_deleted='false'

//   and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `
//           await bookshelf.knex.raw(sqlbid)
//             .then(data => {
//               // console.log('data in buy query----->', data.rows)
//               result.buying.push(data);
//             })
//             .catch(err => {
//               console.log("err in buy query", err)
//             })
//         }
//       }
//       if (groupbySelling[0].length > 0) {
//         for (let eachobj of groupbySelling[0]) {
//           let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
//           sqlask = `select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",
//   s.user_name as sellerUserName,s.first_name as sellerFirst,p."productName" as product_name,
//   s.last_name as sellerLast,b.user_name as bidderUserName,
//   s.company_logo as companylogo,b.company_logo as b_companylogo,
//   b.first_name as bidderFirst,b.last_name as bidderLast, O.id as order_id,O."status",
//   O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail",
//   f."feedback_by_seller" as seller_feedback,f."feedback_by_bidder" as bidder_feedback from counters c
//   LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
//   LEFT OUTER JOIN images i on i."productId" = c."product_id"
//   LEFT OUTER JOIN users s on s.id = c."seller_id"
//   LEFT OUTER JOIN users b on b.id = c."bidder_id"
//   LEFT OUTER JOIN products p on p.id = c."product_id"
//   LEFT OUTER JOIN orders O on c.id = O."counter_id"
//   LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"
//   where c."created_at"='${create}' and
//   c."bidder_id"=${eachobj.bidder_id} and c."expiry_day"=${eachobj.expiry_day}
//   and c."product_id"=${eachobj.product_id}
//   and c.seller_id=${eachobj.seller_id} and c.is_deleted='false'
//   and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `
//           await bookshelf.knex.raw(sqlask)
//             .then(data => {
//               // console.log('data in sell query----->', data.rows)
//               result.selling.push(data);
//             })
//             .catch(err => {
//               console.log("err in sell query", err)
//             })
//         }
//       }
//       var sell = result.selling;
//       var buy = result.buying;
//       var temp = []
//       var temp1 = [];
//       for (var i = 0; i < sell.length; i++) {
//         for (var j = 0; j < sell[i].rows.length; j++) {
//           temp.push(sell[i].rows[j])
//         }
//       }
//       for (var i = 0; i < buy.length; i++) {
//         for (var j = 0; j < buy[i].rows.length; j++) {
//           temp1.push(buy[i].rows[j])
//         }
//       }
//       result.selling = temp;
//       result.buying = temp1;

//       return res.json(Response(constant.statusCode.ok, "Pending offers fetched", result));
//       // return res.json(Response(constant.statusCode.ok, "Active Offer fetched", result));
//     }
//     catch (err) {
//       console.log("err in Pending Offers", err)
//     }
//   }
//   getPendingOfferByUserId().then(response => { })

// }

function getPendingOfferByUserId(req, res) {
  async function getPendingOfferByUserId() {
    try {
      const searchTexr = String(req.body.searchName);
      const searchArray = searchTexr.split(' ');
      console.log('searchArray', searchArray);
      if (req.body.searchName) {
        console.log('searchArray***************************');

        let result = {
          selling: [],
          buying: [],
        };
        let groupbySelling = [];
        let groupbyBuying = [];
        // and type_of_offer='Accept'
        // and type_of='bid'
        //and type_of_offer='Accept'
        //and type_of='bid'
        console.log('userid is', req.body.loggedUser);
        // const sData = await common_query.findAllData(CounterModel, { "id": 6318 })
        // console.log('sDatatatatataat', sData.data.toJSON())
        let groupbySellingsql = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status
    from counters where seller_id=${req.body.loggedUser} 
    and is_deleted='false'  group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status ;`;
        await bookshelf.knex.raw(groupbySellingsql).then((data) => {
          // console.log('selling query res----------------------', data.rows)
          groupbySelling.push(data.rows);
        });
        let groupbyBuyingsql = `select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status
    from counters where bidder_id=${req.body.loggedUser}  and is_deleted='false'
    group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status ;`;
        await bookshelf.knex.raw(groupbyBuyingsql).then((data) => {
          // console.log('buying query res-------------------', data.rows)
          groupbyBuying.push(data.rows);
        });

        if (groupbyBuying[0].length > 0) {
          for (let eachobj of groupbyBuying[0]) {
            let searchChar, orderQuery;

            if (searchArray.length == 1) {
              searchChar = `(s."user_name"
        ilike '%${req.body.searchName}%')  AND s.is_active=true `;
            } else if (searchArray.length > 1) {
              searchChar = `(s."user_name"
        ilike '%${searchArray[0]}%')  AND s.is_active=true `;
            }
            let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
            sqlbid = `select c.*,i."imageUrl",sum(c."total_amount")
    OVER() AS full_amount,a.type,a."producttype",s.user_name as sellerUserName,
    s.company_logo as companylogo,s.first_name as sellerFirst,p."productName" as product_name,
    s.last_name as sellerLast,b.user_name as bidderUserName,b.first_name as bidderFirst,
    b.company_logo as b_companylogo,b.last_name as bidderLast,
    O.id as order_id,O."status", O."delivered", O."createdbyId",
    O."track_no",O."courier",O."paymentdetail",f."feedback_by_seller" as seller_feedback,
    f."feedback_by_bidder" as bidder_feedback from counters c
    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
    LEFT OUTER JOIN images i on i."productId" = c."product_id"
    LEFT OUTER JOIN users s on s.id = c."seller_id"
    LEFT OUTER JOIN users b on b.id = c."bidder_id"
    LEFT OUTER JOIN products p on p.id = c."product_id"
    LEFT OUTER JOIN orders O on c.id = O."counter_id"
    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"
    where c."created_at"='${create}' and c."seller_id"=${eachobj.seller_id}
    and c."expiry_day"=${eachobj.expiry_day}
    and  ${searchChar ? searchChar : ''}
    and c."product_id"=${eachobj.product_id} and c.bidder_id=${eachobj.bidder_id}
    and c.is_deleted='false'

    and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
            await bookshelf.knex
              .raw(sqlbid)
              .then((data) => {
                // console.log('data in buy query----->', data.rows)
                result.buying.push(data);
              })
              .catch((err) => {
                console.log('err in buy query', err);
              });
          }
        }
        if (groupbySelling[0].length > 0) {
          for (let eachobj of groupbySelling[0]) {
            let searchChar, orderQuery;
            if (searchArray.length == 1) {
              searchChar = `(b."user_name"
            ilike '%${req.body.searchName}%') AND b.is_active=true `;
            } else if (searchArray.length > 1) {
              searchChar = `(b."user_name"
            ilike '%${searchArray[0]}%') AND b.is_active=true `;
            }
            let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
            sqlask = `select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",
    s.user_name as sellerUserName,s.first_name as sellerFirst,p."productName" as product_name,
    s.last_name as sellerLast,b.user_name as bidderUserName,
    s.company_logo as companylogo,b.company_logo as b_companylogo,
    b.first_name as bidderFirst,b.last_name as bidderLast, O.id as order_id,O."status",
    O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail",
    f."feedback_by_seller" as seller_feedback,f."feedback_by_bidder" as bidder_feedback from counters c
    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
    LEFT OUTER JOIN images i on i."productId" = c."product_id"
    LEFT OUTER JOIN users s on s.id = c."seller_id"
    LEFT OUTER JOIN users b on b.id = c."bidder_id"
    LEFT OUTER JOIN products p on p.id = c."product_id"
    LEFT OUTER JOIN orders O on c.id = O."counter_id"
    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"
    where c."created_at"='${create}' and
    c."bidder_id"=${eachobj.bidder_id} and c."expiry_day"=${eachobj.expiry_day}
    and c."product_id"=${eachobj.product_id}
    and c.seller_id=${eachobj.seller_id} and c.is_deleted='false'
    and  ${searchChar ? searchChar : ''}
    and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
            await bookshelf.knex
              .raw(sqlask)
              .then((data) => {
                // console.log('data in sell query----->', data.rows)
                result.selling.push(data);
              })
              .catch((err) => {
                console.log('err in sell query', err);
              });
          }
        }
        var sell = result.selling;
        var buy = result.buying;
        var temp = [];
        var temp1 = [];
        for (var i = 0; i < sell.length; i++) {
          for (var j = 0; j < sell[i].rows.length; j++) {
            temp.push(sell[i].rows[j]);
          }
        }
        for (var i = 0; i < buy.length; i++) {
          for (var j = 0; j < buy[i].rows.length; j++) {
            temp1.push(buy[i].rows[j]);
          }
        }
        result.selling = temp;
        result.buying = temp1;

        return res.json(Response(constant.statusCode.ok, 'Pending offers fetched', result));
      } else {
        console.log('searchArray no search ***************************');
        let result = {
          selling: [],
          buying: [],
        };
        let groupbySelling = [];
        let groupbyBuying = [];
        // and type_of_offer='Accept'
        // and type_of='bid'
        //and type_of_offer='Accept'
        //and type_of='bid'

        console.log('userid is', req.body.loggedUser);
        // const sData = await common_query.findAllData(CounterModel, { "id": 6318 })
        // console.log('sDatatatatataat', sData.data.toJSON())
        let groupbySellingsql = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status
    from counters where seller_id=${req.body.loggedUser} and (status='accept' or status='decline')
    and is_deleted='false'  group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status ;`;
        await bookshelf.knex.raw(groupbySellingsql).then((data) => {
          // console.log('selling query res----------------------', data.rows)
          groupbySelling.push(data.rows);
        });
        let groupbyBuyingsql = `select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status
    from counters where bidder_id=${req.body.loggedUser} and (status='accept' or status='decline') and is_deleted='false'
    group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status ;`;
        await bookshelf.knex.raw(groupbyBuyingsql).then((data) => {
          // console.log('buying query res-------------------', data.rows)
          groupbyBuying.push(data.rows);
        });

        if (groupbyBuying[0].length > 0) {
          for (let eachobj of groupbyBuying[0]) {
            let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
            sqlbid = `select c.*,i."imageUrl",sum(c."total_amount")
    OVER() AS full_amount,a.type,a."producttype",s.user_name as sellerUserName,
    s.company_logo as companylogo,s.first_name as sellerFirst,p."productName" as product_name,
    s.last_name as sellerLast,b.user_name as bidderUserName,b.first_name as bidderFirst,
    b.company_logo as b_companylogo,b.last_name as bidderLast,
    O.id as order_id,O."status", O."delivered", O."createdbyId",
    O."track_no",O."courier",O."paymentdetail",f."feedback_by_seller" as seller_feedback,
    f."feedback_by_bidder" as bidder_feedback from counters c
    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
    LEFT OUTER JOIN images i on i."productId" = c."product_id"
    LEFT OUTER JOIN users s on s.id = c."seller_id"
    LEFT OUTER JOIN users b on b.id = c."bidder_id"
    LEFT OUTER JOIN products p on p.id = c."product_id"
    LEFT OUTER JOIN orders O on c.id = O."counter_id"
    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"
    where c."created_at"='${create}' and c."seller_id"=${eachobj.seller_id}
    and c."expiry_day"=${eachobj.expiry_day}

    and c."product_id"=${eachobj.product_id} and c.bidder_id=${eachobj.bidder_id}
    and c.is_deleted='false'

    and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
            await bookshelf.knex
              .raw(sqlbid)
              .then((data) => {
                // console.log('data in buy query----->', data.rows)
                result.buying.push(data);
              })
              .catch((err) => {
                console.log('err in buy query', err);
              });
          }
        }
        if (groupbySelling[0].length > 0) {
          for (let eachobj of groupbySelling[0]) {
            let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
            sqlask = `select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",
    s.user_name as sellerUserName,s.first_name as sellerFirst,p."productName" as product_name,
    s.last_name as sellerLast,b.user_name as bidderUserName,
    s.company_logo as companylogo,b.company_logo as b_companylogo,
    b.first_name as bidderFirst,b.last_name as bidderLast, O.id as order_id,O."status",
    O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail",
    f."feedback_by_seller" as seller_feedback,f."feedback_by_bidder" as bidder_feedback from counters c
    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
    LEFT OUTER JOIN images i on i."productId" = c."product_id"
    LEFT OUTER JOIN users s on s.id = c."seller_id"
    LEFT OUTER JOIN users b on b.id = c."bidder_id"
    LEFT OUTER JOIN products p on p.id = c."product_id"
    LEFT OUTER JOIN orders O on c.id = O."counter_id"
    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"
    where c."created_at"='${create}' and
    c."bidder_id"=${eachobj.bidder_id} and c."expiry_day"=${eachobj.expiry_day}
    and c."product_id"=${eachobj.product_id}
    and c.seller_id=${eachobj.seller_id} and c.is_deleted='false'
    and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
            await bookshelf.knex
              .raw(sqlask)
              .then((data) => {
                // console.log('data in sell query----->', data.rows)
                result.selling.push(data);
              })
              .catch((err) => {
                console.log('err in sell query', err);
              });
          }
        }
        var sell = result.selling;
        var buy = result.buying;
        var temp = [];
        var temp1 = [];
        for (var i = 0; i < sell.length; i++) {
          for (var j = 0; j < sell[i].rows.length; j++) {
            temp.push(sell[i].rows[j]);
          }
        }
        for (var i = 0; i < buy.length; i++) {
          for (var j = 0; j < buy[i].rows.length; j++) {
            temp1.push(buy[i].rows[j]);
          }
        }
        result.selling = temp;
        result.buying = temp1;

        return res.json(Response(constant.statusCode.ok, 'Pending offers fetched', result));
      }

      // return res.json(Response(constant.statusCode.ok, "Active Offer fetched", result));
    } catch (err) {
      console.log('err in Pending Offers', err);
    }
  }
  getPendingOfferByUserId().then((response) => {});
}

function getActiveOfferByUserId(req, res) {
  async function getActiveOfferByUserId() {
    try {
      let result = {};
      // let type_of_offer = ['Counter','Accept'];
      // let type_of = ['ask','bid']
      // for(let i of type_of_offer){
      // for(let j of type_of){
      sqlbid = `select c.*,i."imageUrl",a.type,a."producttype",s.user_name as sellerUserName,s.first_name as sellerFirst,p."productName" as product_name,
  s.last_name as sellerLast,s.company_logo as companylogo,b.company_logo as b_companylogo,b.user_name as bidderUserName,b.first_name as bidderFirst,b.last_name as bidderLast from counters c
  LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
  LEFT OUTER JOIN images i on i."productId" = c."product_id"
  LEFT OUTER JOIN users s on s.id = c."seller_id"
  LEFT OUTER JOIN users b on b.id = c."bidder_id"
  LEFT OUTER JOIN products p on p.id = c."product_id"
  where (c."bidder_id"=${req.body.loggedUser})
  and (c.expiry_date > now() AT TIME ZONE 'UTC' and c.is_deleted=false and c.type_of_offer='Counter' and c.type_of='bid' );`;
      await bookshelf.knex
        .raw(sqlbid)
        .then((data) => {
          result.counterBid = data;
        })
        .catch((err) => {
          console.log('err');
        });

      sqlask = `select c.*,i."imageUrl",a.type,a."producttype",s.user_name as sellerUserName
  ,s.company_logo as companylogo,s.first_name as sellerFirst,p."productName" as product_name,b.company_logo as b_companylogo
  ,s.last_name as sellerLast,b.user_name as bidderUserName,b.first_name as bidderFirst,b.last_name as bidderLast from counters c
  LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
  LEFT OUTER JOIN images i on i."productId" = c."product_id"
  LEFT OUTER JOIN users s on s.id = c."seller_id"
  LEFT OUTER JOIN users b on b.id = c."bidder_id"
  LEFT OUTER JOIN products p on p.id = c."product_id"
  where (c."seller_id"=${req.body.loggedUser})
  and (c.expiry_date > now() AT TIME ZONE 'UTC' and c.is_deleted=false and c.type_of_offer='Counter' and c.type_of='ask' );`;
      await bookshelf.knex
        .raw(sqlask)
        .then((data) => {
          result.counterAsk = data;
        })
        .catch((err) => {
          console.log('err');
        });

      // }
      // }
      return res.json(Response(constant.statusCode.ok, 'Active Offer fetched', result));
    } catch (err) {
      console.log('err in getActiveOfferByUserId');
    }
  }
  getActiveOfferByUserId().then((respond) => {});
}

function getActiveRecievedByUserId(req, res) {
  async function getActiveRecievedByUserId() {
    try {
      let result = {};

      sqlask = `
      select c.*,
		 i."imageUrl",
		 a.type,a."producttype",
		 s.user_name as sellerUserName,
		 p."productName" as product_name,
		 b.user_name as bidderUserName,
		 O.id as order_id,O."status" as "order_status", O."delivered", O."createdbyId", O."track_no",O."courier",O."paymentdetail",
		 f."feedback_by_seller" as seller_feedback, f."feedback_by_bidder" as bidder_feedback
	from counters c
    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
    LEFT OUTER JOIN images i on i."productId" = c."product_id"
    LEFT OUTER JOIN users s on s.id = c."seller_id"
    LEFT OUTER JOIN users b on b.id = c."bidder_id"
    LEFT OUTER JOIN products p on p.id = c."product_id"
    LEFT OUTER JOIN orders O on c.id = O."counter_id"
    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"
    where (c."bidder_id"=${req.body.loggedUser}  or c."seller_id"=${req.body.loggedUser} )
    and c.is_deleted='false'
    and ( type_of='bid' or type_of='ask')
    and (c."status" is not NULL or  c.expiry_date > now() AT TIME ZONE 'UTC') `;

      await bookshelf.knex
        .raw(sqlask)
        .then((data) => {
          result = data.rows;
        })
        .catch((err) => {
          console.log('err');
        });

      return res.json(Response(constant.statusCode.ok, 'Active Recieved Offer fetched', result));
    } catch (err) {
      console.log('err in getActiveOfferByUserId');
    }
  }
  getActiveRecievedByUserId().then((respond) => {});
}

function editUser(req, res) {
  async function editUserMethod() {
    let isDuplictate = false;
    let sameId = false;
    if (req.body && req.body.user_name == 'null') {
      req.body.user_name = '';
    }
    if (req.body && req.body.user_name) {
      let condition = `select * from users where "user_name" iLike '${req.body.user_name}' and "is_deleted"=false;`;
      let checkDuplicate = await bookshelf.knex.raw(condition);
      let data = checkDuplicate['rows'];
      if (data && data.length > 0 && data[0].id == req.body.id) {
        isDuplictate = false;
        sameId = true;
      }
      if (checkDuplicate.rowCount > 0 && !sameId) {
        isDuplictate = true;
        return res.json(Response(constant.statusCode.alreadyExist, 'Username has already been registered. Try with different Username'));
      }
    }

    if (!isDuplictate || !req.body.user_name) {
      let updatedata = {
        first_name: req.body.first_name ? req.body.first_name : null,
        last_name: req.body.last_name ? req.body.last_name : null,
        company_name: req.body.companyname ? req.body.companyname : null,
        user_name: req.body.user_name ? req.body.user_name : '',
        phone_number: req.body.phone_number ? req.body.phone_number : null,

        billingaddress1: req.body.billingaddress1 ? req.body.billingaddress1 : null,
        billingaddress2: req.body.billingaddress2 ? req.body.billingaddress2 : null,
        billingcity: req.body.billingcity ? req.body.billingcity : null,
        billingstate: req.body.billingstate ? req.body.billingstate : null,
        billingzipcode: req.body.billingzipcode ? req.body.billingzipcode : null,

        shippingaddress1: req.body.shippingaddress1 ? req.body.shippingaddress1 : null,
        shippingaddress2: req.body.shippingaddress2 ? req.body.shippingaddress2 : null,
        shippingcity: req.body.shippingcity ? req.body.shippingcity : null,
        shippingstate: req.body.shippingstate ? req.body.shippingstate : null,
        shippingzipcode: req.body.shippingzipcode ? req.body.shippingzipcode : null,
        is_emailblast: req.body.is_emailblast ? req.body.is_emailblast : false,
      };

      let condition = {
        id: req.body.id,
      };

      let updateUserData = await common_query.updateRecord(UserModel, updatedata, condition);

      let finaldata = updateUserData.success.toJSON();
      if (updateUserData.code == 200) {
        let timeStamp = JSON.stringify(Date.now());
        let db_path = '';
        let extension;
        // console.log('req.files))))', req.files, 'req.files.file', req.files.file)

        if (req.files) {
          if (req.files.file) {
            extension = req.files.file.name.split('.');
            let imgOriginalName = req.files.file.name;
            db_path = timeStamp + '_' + imgOriginalName;
            let extensionArray = ['jpg', 'jpeg', 'png', 'jfif'];
            let format = extension[extension.length - 1];
            if (extensionArray.includes(format)) {
              // const result = await common_query.fileUpload(path, (req.files.file.data));
              const result = await s3file_upload.uploadProfileImage(req.files.file.data, db_path);
              var updata = {
                id: req.body.id,
                profile_image_url: result.url,
                profile_image_id: uuidv4(),
              };
              let cond = {
                id: req.body.id,
              };
              await common_query.updateRecord(UserModel, updata, cond);
              finaldata.profile_image_url = result.url;
            }
          }
          if (req.files.clogo_file) {
            cextension = req.files.clogo_file.name.split('.');
            let cimgOriginalName = req.files.clogo_file.name;
            cdb_path = timeStamp + '_' + cimgOriginalName;

            let cextensionArray = ['jpg', 'jpeg', 'png', 'jfif'];
            let cformat = cextension[cextension.length - 1];
            if (cextensionArray.includes(cformat)) {
              // const cresult = await common_query.fileUpload(
              //   cpath,
              //   req.files.clogo_file.data
              // );
              const cresult = await s3file_upload.uploadCompanyImage(req.files.clogo_file.data, cdb_path);
              console.log('cresult--->', cresult);
              var cupdata = { id: req.body.id, company_logo: cresult.url };
              let clogo_cond = {
                id: req.body.id,
              };
              var updateCImage = await common_query.updateRecord(UserModel, cupdata, clogo_cond);
              console.log('logo update status', updateCImage);
              finaldata.company_logo = cresult.url;
              // let updateImage1 = await common_query.updateRecord(UserModel, cupdata, clogo_cond)
            }
          }
          return res.json(Response(constant.statusCode.ok, 'User edit successful', finaldata));
        } else {
          return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, finaldata));
        }
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
      }
    }
  }
  editUserMethod().then((data) => {});
}

function updateprofile(req, res) {
  async function updateUserProfileMethod() {
    let updatedata = {
      // address: req.body.address ? req.body.address : null,
      // billing_address: req.body.billing_address ? req.body.billing_address : null,
      // city: req.body.city ? req.body.city : null,
      // country: req.body.country ? req.body.country : null,
      // first_name: req.body.first_name ? req.body.first_name : null,
      // last_name: req.body.last_name ? req.body.last_name : null,
      // phone_number: req.body.phone_number ? req.body.phone_number : null,
      // shipping_address: req.body.shipping_address ? req.body.shipping_address : null,
      // zip_code: req.body.zip_code ? req.body.zip_code : null,
      term_shipping: req.body.term_shipping ? req.body.term_shipping : null,
      payment_mode: req.body.payment_mode ? req.body.payment_mode : null,
      payment_timing: req.body.payment_timing ? req.body.payment_timing : null,
      additional_term: req.body.additional_term ? req.body.additional_term : null,
    };
    let condition = {
      id: req.body.id,
    };

    let updateUserData = await common_query.updateRecord(UserModel, updatedata, condition);
    if (updateUserData.code == 200) {
      //   let timeStamp = JSON.stringify(Date.now());
      // let db_path = '';
      // let path = '';
      // let extension;
      // mkdirp(config1.ARTICLEIMAGE).then(async function (data, err) {
      //   if (err) {
      //     return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, err));
      //   } else {
      //     if (req.files) {
      //       extension = req.files.file.name.split(".");
      //       let imgOriginalName = req.files.file.name;
      //       console.log('imgOriginalName:::::', imgOriginalName);
      //       path = config1.PRODUCTIMAGE + timeStamp + "_" + imgOriginalName;
      //       db_path = timeStamp + "_" + imgOriginalName;
      //       if (path != '') {
      //         let extensionArray = ["jpg", "jpeg", "png", "jfif"];
      //         let format = extension[extension.length - 1];
      //         if (extensionArray.includes(format)) {
      //           const result = await common_query.fileUpload(path, (req.files.file.data));
      //           var updata = { id: req.body.id, profile_image_url: db_path, profile_image_id: uuidv4() }
      //           let cond = {
      //             id: req.body.id
      //           }
      //           const updateImage = await common_query.updateRecord(UserModel, updata , cond)
      //           if (updateImage.code == 200) {
      //             return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, updateImage));

      //           } else {
      //             console.log("updateImage error");
      //             return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));

      //           }
      //         }
      //         else {
      //           return res.json(Response(constant.statusCode.unauth, constant.validateMsg.notSupportedType));
      //         }
      //       }
      //     }
      //   }
      // })
      return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  updateUserProfileMethod().then((data) => {});
}

function deleteUser(req, res) {
  async function deleteUserMethod() {
    let updatedata = {
      is_deleted: true,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(UserModel, updatedata, condition);
    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.userDeleteSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  deleteUserMethod().then((data) => {});
}
function deleteOffer(req, res) {
  async function deleteOffer() {
    console.log('declinee offerrrrrr', req.body);
    let updatedata = {
      is_deleted: false,
      status: 'decline',
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(CounterModel, updatedata, condition);
    console.log('updateUserData', updateUserData);
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    newdate = year + '-' + month + '-' + day;

    let data = {
      counter_id: req.body.id ? req.body.id : null,
      status: 'decline',
      is_deleted: false,
      product_id: req.body.product_id ? req.body.product_id : null,
      createdbyId: req.body.createdbyId ? req.body.createdbyId : null,
      created_at: newdate,
    };
    let orderdata = {};
    orderdata = await common_query.saveRecord(OrderModel, data);
    const condition_chat = {
      o_id: req.body.id.toString(),
      p_id: req.body.product_id.toString(),
    };
    var sql = `select * from chats where message->'msg'->>
    'offer_id'=${"'" + condition_chat.o_id + "'"}
and message->'msg'->>'product_id'=${"'" + condition_chat.p_id + "'"}`;
    // console.log('queryyyyyyyyyyyyyy_______________--', sql)

    bookshelf.knex.raw(sql).then(async (data) => {
      /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
      let updatedata1 = {
        isActionPerformedbyRecieved: true,
        isofferAccepted: false,
      };
      if (data.rows[0]) {
        let condition1 = {
          id: data.rows[0].id,
        };
        console.log('data.rows[0]data.rows[0] ', data.rows[0]);
        const u_chat = await common_query.updateRecord(ChatModel, updatedata1, condition1);
        console.log('u_chat accept 43434343444 1111111111', u_chat);
      }
    });

    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, 'Offer Declined Successfully', updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  deleteOffer().then((data) => {});
}

function deleteAllOffer(req, res) {
  async function deleteAllOffer() {
    try {
      console.log('delete offers reqqqqqqq::::::', req.body);
      if (req.body.length > 0) {
        for (var i = 0; i < req.body.length; i++) {
          if (req.body[i]) {
            var updatedata = {
              // is_deleted: true,
              status: 'decline',
            };
            let condition = {
              id: req.body[i].id,
            };
            var updateUserData = await common_query.updateRecord(CounterModel, updatedata, condition);
            console.log('uuuuuuuuuuuuuuuuuuuuuuuuuuuuu################', updateUserData);
            var dateObj = new Date();
            var month = dateObj.getUTCMonth() + 1; //months from 1-12
            var day = dateObj.getUTCDate();
            var year = dateObj.getUTCFullYear();
            newdate = year + '-' + month + '-' + day;

            let data = {
              counter_id: req.body[i].id ? req.body[i].id : null,
              status: 'decline',
              is_deleted: false,
              product_id: req.body[i].product_id ? req.body[i].product_id : null,
              createdbyId: req.body[i].type_of == 'ask' ? req.body[i].seller_id : req.body[i].bidder_id,
              created_at: newdate,
            };
            let orderdata = {};
            orderdata = await common_query.saveRecord(OrderModel, data);
            const condition_chat = {
              o_id: req.body[i].id.toString(),
              p_id: req.body[i].product_id.toString(),
            };
            var sql = `select * from chats where message->'msg'->>
            'offer_id'=${"'" + condition_chat.o_id + "'"}
      and message->'msg'->>'product_id'=${"'" + condition_chat.p_id + "'"}`;
            // console.log('queryyyyyyyyyyyyyy_______________--', sql)

            bookshelf.knex.raw(sql).then(async (data) => {
              /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
              let updatedataD = {
                isActionPerformedbyRecieved: true,
                isofferAccepted: false,
              };
              let conditionD = {
                id: data.rows[0].id,
              };
              console.log('data.rows[0]data.rows[0] ', data.rows[0]);
              const u_chat = await common_query.updateRecord(ChatModel, updatedataD, conditionD);
              console.log('u_chat accept 43434343444 ', u_chat);
            });
          }
        }
        return res.json(Response(constant.statusCode.ok, 'Offer Declined Successfully', updateUserData));
      }
    } catch (err) {
      console.log('err in delete', err);
    }
  }
  deleteAllOffer().then((response) => {});
}

function addTrackNo(req, res) {
  async function addTrackNoMethod() {
    let updatedata = {
      track_no: req.body.track_no,
      courier: req.body.courier,
      shipment_date: new Date(),
    };
    let update = {
      track_no: req.body.track_no,
      shipment_date: new Date(),
    };
    let condition = {
      counter_id: req.body.counter_id,
    };
    let cond = {
      id: req.body.counter_id,
    };
    await common_query.updateRecord(CounterModel, update, cond);
    let updateUserData = await common_query.updateRecord(OrderModel, updatedata, condition);
    let notObj = {
      created_by: req.body.createdbyId,
      content: 'shipped your item',
      destnation_user_id: req.body.createdForId,
    };
    utility.addNotification(notObj, function (err, resp) {
      if (err) {
        console.log('Error adding notification in add tracking number', err);
      } else {
        console.log('response after calling common add notification in add tracking number', resp);
      }
    });

    if (updateUserData.code == 200) {
      var sql = `select c.*,O."track_no" from counters c
                    LEFT OUTER JOIN orders O on c.id = O."counter_id"
                    WHERE (c."id" = ?) and c."is_deleted" = false;`;
      var raw2 = bookshelf.knex.raw(sql, [req.body.counter_id]);
      raw2.then(function (result) {
        return res.json(Response(constant.statusCode.ok, constant.messages.trackNoAdded, result));
      });
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result));
    }
  }
  addTrackNoMethod().then((data) => {});
}

function addPaymentDetail(req, res) {
  async function addPaymentDetailMethod() {
    let updatedata = {
      paymentdetail: req.body.paymentdetail,
      payment_date: new Date(),
    };

    let condition = {
      counter_id: req.body.counter_id,
    };

    let updateUserData = await common_query.updateRecord(OrderModel, updatedata, condition);
    let update = {
      payment_date: new Date(),
    };
    let cond = {
      id: req.body.counter_id,
    };
    await common_query.updateRecord(CounterModel, update, cond);
    let notObj = {
      created_by: req.body.createdbyId,
      content: 'sent payment',
      destnation_user_id: req.body.createdForId,
    };
    utility.addNotification(notObj, function (err, resp) {
      if (err) {
        console.log('Error adding notification inp ayment offer', err);
      } else {
        console.log('response after calling common add notification in payment offer', resp);
      }
    });
    if (updateUserData.code == 200) {
      var sql = `select c.*,O."status",O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c
                    LEFT OUTER JOIN orders O on c.id = O."counter_id"
                    WHERE (c."id" = ?) and c."is_deleted" = false;`;
      var raw2 = bookshelf.knex.raw(sql, [req.body.counter_id]);
      raw2.then(function (result) {
        return res.json(Response(constant.statusCode.ok, constant.messages.paymentdetail, result));
      });
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result));
    }
  }
  addPaymentDetailMethod().then((data) => {});
}

function uplodeProfileImage(req, res) {
  async function uplodeProfileImageMethod() {
    let timeStamp = JSON.stringify(Date.now());
    userid = 'get_user_id';
    let db_path = '';
    let path = '';
    let extension;
    mkdirp(config.ARTICLEIMAGE).then(async function (data, err) {
      if (err) {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, err));
      } else {
        if (req.body) {
          extension = req.files.file.name.split('.');
          let imgOriginalName = req.files.file.name;
          path = config.PRODUCTIMAGE + timeStamp + '_' + imgOriginalName;
          db_path = timeStamp + '_' + imgOriginalName;
          if (path != '') {
            let extensionArray = ['jpg', 'jpeg', 'png', 'jfif'];
            let format = extension[extension.length - 1];
            if (extensionArray.includes(format)) {
              // const result = await common_query.fileUpload(path, (req.files.file.data));
              const result = await s3file_upload.uploadProductImage(req.files.file.data, db_path);
              const updateImage = await common_query.updateRecord(imageModel, { imageUrl: result.url }, { productId: producr_id });
            } else {
              return res.json(Response(constant.statusCode.unauth, constant.validateMsg.notSupportedType));
            }
          }
        }
      }
    });
    return res.json(Response(constant.statusCode.ok, constant.messages.Addproduct, savePrtoductData));
  }
  uplodeProfileImageMethod().then((data) => {});
}

function editProfil(req, res) {
  async function editprofilrMethod() {
    const {
      first_name,
      last_name,
      email,
      password,
      phone_number,
      address,
      city,
      state,
      country,
      zip_code,
      profile_image_id,
      date_of_birth,
    } = req.body;
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    newdate = year + '-' + month + '-' + day;
    let data = {
      first_name: first_name ? first_name : null,
      last_name: last_name ? last_name : null,
      email: email ? email : null,
      phone_number: phone_number ? phone_number : null,
      address: address ? address : null,
      city: city ? city : null,
      state: state ? state : null,
      country: country ? country : null,
      zip_code: zip_code ? zip_code : null,
      date_of_birth: date_of_birth ? date_of_birth : null,
      password: crypto.encrypt(password),
      profile_image_id: profile_image_id ? profile_image_id : null,
      is_deleted: false,
      user_id: uuidv4(),
      updated_at: newdate,
    };
    let condition = {
      id: 'user_id',
    };
    let saveUserData = await common_query.updateRecord(UserModel, data, condition);
    //   console.log(saveUserData);
    if (saveUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.Registration, saveUserData));
    } else if (saveUserData.code == 409) {
      console.log('saveUserData===>in else');

      return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
    }
  }
  editprofilrMethod().then((data) => {});
}

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

function saveUser(req, res) {
  async function saveUserMethod() {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        phone_number,
        address,
        city,
        state,
        country,
        zip_code,
        profile_image_id,
        date_of_birth,
        user_name,
        billingaddress1,
        billingaddress2,
        billingcity,
        billingstate,
        billingzipcode,
        companyname,
        role,
        shippingaddress1,
        shippingaddress2,
        shippingcity,
        shippingstate,
        shippingzipcode,
        id,
      } = req.body;

      let isDuplictate = false;
      let condition = `select * from users where "email" iLike '${email}' and "is_deleted"=false;`;
      let checkDuplicate = await bookshelf.knex.raw(condition);
      if (checkDuplicate.rowCount > 0) {
        isDuplictate = true;
        return res.json(
          Response(constant.statusCode.alreadyExist, 'E-Mail Id you are trying is already been registered. Try with different Email-Id', {
            emailError: 'emailError',
          })
        );
      }

      if (!isDuplictate) {
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        newdate = year + '-' + month + '-' + day;
        let data = {
          first_name: first_name ? first_name : null,
          last_name: last_name ? last_name : null,
          email: email ? email : null,
          phone_number: phone_number ? phone_number : null,
          address: address ? address : null,
          city: city ? city : null,
          state: state ? state : null,
          country: country ? country : null,
          zip_code: zip_code ? zip_code : null,
          date_of_birth: date_of_birth ? date_of_birth : null,
          password: crypto.encrypt(password),
          profile_image_id: profile_image_id ? profile_image_id : null,
          billingaddress1: billingaddress1 ? billingaddress1 : null,
          billingaddress2: billingaddress2 ? billingaddress2 : null,
          billingcity: billingcity ? billingcity : null,
          billingstate: billingstate ? billingstate : null,
          billingzipcode: billingzipcode ? billingzipcode : null,
          companyname: companyname ? companyname : null,
          shippingaddress1: shippingaddress1 ? shippingaddress1 : null,
          shippingaddress2: shippingaddress2 ? shippingaddress2 : null,
          shippingcity: shippingcity ? shippingcity : null,
          shippingstate: shippingstate ? shippingstate : null,
          shippingzipcode: shippingzipcode ? shippingzipcode : null,
          role: role ? (role == 'admin' ? 'admin' : 'user') : null,
          is_deleted: false,
          user_id: uuidv4(),
          user_name: user_name ? user_name : null,
          created_at: newdate,
          is_active: true,
        };
        let condition = {
          email: email,
        };
        let saveUserData = await common_query.saveRecordOnCondition(UserModel, data, condition);
        if (saveUserData.code == 200) {
          // console.log("*********saveUserData********",saveUserData);
          var successResponcetoJson = JSON.stringify(saveUserData.success);
          var success = JSON.parse(successResponcetoJson);
          const updateImage = await common_query.saveRecord(imageModel, {
            imageUrl: 'defult_path',
            userId: success.id,
          });
          if (updateImage.code == 200) {
            var cond = {
              isdeleted: false,
              settingname: 'emailsetting',
            };
            const getStatus = await common_query.findAllData(settingModel, cond);
            let finalData = getStatus.data.toJSON();
            if (getStatus.code == 200) {
              var admindata = finalData[0].settingvalue; //   email: "varuny.sdei@gmail.com"
              var title = req.body.first_name + ' ' + req.body.last_name + ' Registration Activation Notification';
              utility.readTemplateSendMailV2(admindata.email, title, admindata, 'new_user', function (err, resp) {
                if (err) {
                  console.log('sign up err>>>>>', err);
                } else if (resp) {
                  console.log('signup up success');
                }
              });

              return res.json(Response(constant.statusCode.ok, constant.messages.Registration, saveUserData));
            } else {
              return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, {}));
            }
          } else {
            return res.json(Response(constant.statusCode.internalError, constant.validateMsg.internalError));
          }
        } else if (saveUserData.code == 409) {
          console.log('saveUserData===>in else');
          return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
        }
      }
    } catch (err) {}
  }
  saveUserMethod().then((data) => {});
}

// function saveUser(req, res) {
//   async function saveUserMethod() {
//     console.log("Check the add", req.body);
//     const {
//       first_name,
//       last_name,
//       email,
//       password,
//       phone_number,
//       address,
//       city,
//       state,
//       country,
//       zip_code,
//       profile_image_id,
//       date_of_birth,
//       id
//     } = req.body;
//     var dateObj = new Date();
//     var month = dateObj.getUTCMonth() + 1; //months from 1-12
//     var day = dateObj.getUTCDate();
//     var year = dateObj.getUTCFullYear();

//     newdate = year + "-" + month + "-" + day;
//     let data = {
//       first_name: first_name ? first_name : null,
//       last_name: last_name ? last_name : null,
//       email: email ? email : null,
//       phone_number: phone_number ? phone_number : null,
//       address: address ? address : null,
//       city: city ? city : null,
//       state: state ? state : null,
//       country: country ? country : null,
//       zip_code: zip_code ? zip_code : null,
//       date_of_birth: date_of_birth ? date_of_birth : null,
//       password: crypto.encrypt(password),
//       profile_image_id: profile_image_id ? profile_image_id : null,
//       is_deleted: false,
//       user_id: uuidv4(),
//       created_at: newdate
//     }
//     let condition = {
//     email: email
//     }
//     let saveUserData = await common_query.saveRecordOnCondition(UserModel, data, condition);
//     console.log(saveUserData);
//     if (saveUserData.code == 200) {
//       // console.log("*********saveUserData********",saveUserData);
//       var successResponcetoJson=JSON.stringify(saveUserData.success);
//       var success=JSON.parse(successResponcetoJson);
//       const updateImage = await common_query.saveRecord(imageModel, { imageUrl: "defult_path",userId:success.id })
//       if(updateImage.code==200){
//         return res.json(Response(constant.statusCode.ok, constant.messages.Registration, saveUserData));
//       }else{
//         return res.json(Response(constant.statusCode.internalError, constant.validateMsg.internalError));
//       }
//     } else if (saveUserData.code == 409) {
//       console.log("saveUserData===>in else");
//       return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
//     }
//   }
//   saveUserMethod().then((data) => {
//   })
// }

function sendConfirmationMail(email) {
  return new Promise((resolve, reject) => {});
}

function login2(req, res) {
  res.json('working');
}

function login(req, res) {
  async function loginMethod() {
    try {
      console.log(req.body.email, req.body.password);

      let condition = {
        email: req.body.email,
        is_active: true,
      };
      let loginData = await common_query.findAllData(UserModel, condition).catch((err) => {
        throw err;
      });
      if (loginData.code == 200 && loginData.data.length > 0) {
        let myObjStr = JSON.stringify(loginData.data);
        myObjStr = JSON.parse(myObjStr);
        if (crypto.decrypt(myObjStr[0].password) == req.body.password) {
          let params = { _id: myObjStr[0].id };
          let token = jwt.sign(params, 'B2B');
          let finalData = {
            loginData,
            token,
            params,
          };

          return res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, finalData));
        } else {
          // console.log("=====> 1")
          return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.invalidPassword));
        }
      } else {
        console.log('loginData===>in else');
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.invalidEmailOrPassword, loginData));
      }
    } catch (error) {
      console.log('LOG3', error);
      return res.json(Response(constant.statusCode.internalError, error));
    }
  }
  loginMethod().then((data) => {
    console.log(data);
  });
}

function test(req, res) {
  async function loginMethod() {
    return res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, 'i am safe'));
  }
  loginMethod().then((data) => {});
}

function forgotPassword(req, res) {
  async function forgotPasswordMethod() {
    let condition = {
      email: req.body.email,
    };
    var userdata = await common_query.findAllData(UserModel, condition);
    if (userdata) {
      if (userdata.data.length > 0) {
        var timestamp = Number(new Date());
        var verifingLink = utility.randomValueHex(20) + timestamp + utility.randomValueHex(10);
        let updatedobj = {
          verifying_token: verifingLink,
        };
        var updateduserdata = await common_query.updateRecord(UserModel, updatedobj, condition);
        let myObjStr = JSON.stringify(updateduserdata.data);
        myObjStr = JSON.parse(myObjStr);
        if (myObjStr) {
          var userMailData = {
            email: myObjStr[0].email,
            verifying_token: updatedobj.verifying_token,
          };
          utility.readTemplateSendMailV2(
            myObjStr[0].email,
            'Welcome to B2B MarketPlace - Verify your email address',
            userMailData,
            'reset_password',
            function (err, resp) {
              if (err) {
                console.log('err>>>>>', err);
                return res.json(Response(res, 'Verifying link has not sent.'));
              } else if (resp) {
                return res.json(Response(res, {}, 'Verifying link has been sent to your email.'));
              }
            }
          );
        }
        return res.json(Response(constant.statusCode.ok, constant.messages.forgotPasswordSuccess));
      } else {
        return res.json(Response(constant.statusCode.notFound, constant.messages.invalidEmail));
      }
    }
  }
  forgotPasswordMethod().then((data) => {});
}
function resetpassword(req, res) {
  async function resetPasswordMethod() {
    console.log(req.body.verifying_token);
    if (req.body.password == '' || req.body.verifying_token == '') {
      return response.invalidPassword(res);
    } else {
      var condition = { verifying_token: req.body.verifying_token };
      var userObj = await common_query.findAllData(UserModel, condition);
      let myObjStr = JSON.stringify(userObj.data);
      myObjStr1 = JSON.parse(myObjStr);
      if (myObjStr1.length > 0) {
        var cond = { id: myObjStr1[0].id };
        var updatedobj = {
          password: crypto.encrypt(req.body.password),
          verifying_token: '',
        };
        var updateduserdata = await common_query.updateRecord(UserModel, updatedobj, cond);
        if (updateduserdata) {
          return res.json(Response(constant.statusCode.ok, constant.messages.resetPasswordSuccess));
        } else {
          return response.InternalServer(res, err);
        }
      } else {
        return res.json(Response(constant.statusCode.notFound, constant.messages.invalidToken));
      }
    }
  }
  resetPasswordMethod().then((data) => {});
}

function getUser(req, res) {
  async function getUserMethod() {
    try {
      let sql = `select * from users where "id"= ${req.body.id} and "is_deleted"=false;`;
      // let sql = `select * from users where "id" in  (${req.body.id2},${req.body.id}) and "is_deleted"=false;`

      bookshelf.knex
        .raw(sql)
        .then((data) => {
          console.log(data);
          const resData = data.rows[0].id == req.body.id ? data.rows[0] : data.rows[1].id;
          return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, resData));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getUserMethod().then((data) => {});
}

function getEmailBlastUser(req, res) {
  async function getEmailBlastUserMethod() {
    try {
      let sql = `select id,first_name,last_name,email from users where "is_emailblast"=true and "is_deleted"=false;`;
      bookshelf.knex
        .raw(sql)
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, data.rows));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getEmailBlastUserMethod().then((data) => {});
}

function getOfferById(req, res) {
  async function getOfferByIdMethod() {
    try {
      // const socket = req.app.get("io");
      // console.log('socket', socket)

      if (req.body && req.body.id) {
        var productId = req.body.id;
        var product;
        var sql = `select c.*,O."paymentdetail",i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype"
        ,b.company_logo as b_companylogo ,s.company_logo as companylogo,
        s.first_name as sellerFirst,p."productName" as product_name, p."releaseDate" as release_date,s.user_name as sellerusername,b.user_name as bidderusername,
              s.last_name as sellerLast,s.term_shipping as termsShipping,
              s.payment_mode as paymentMode,
              s.payment_timing as paymentTiming,
              s.additional_term as additionalTerms,
              b.shipping_address as shippingAddress,
              b.shippingaddress1 as shippingaddress1,
b.shippingaddress2 as shippingaddress2,
b.shippingcity as shippingcity,
b.shippingstate as shippingstate,
b.shippingzipcode as shippingzipcode,
              b.first_name
              as bidderFirst,b.last_name as bidderLast from counters c
              LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
              LEFT OUTER JOIN images i on i."productId" = c."product_id"
              LEFT OUTER JOIN users s on s.id = c."seller_id"
              LEFT OUTER JOIN users b on b.id = c."bidder_id"
              LEFT OUTER JOIN products p on p.id = c."product_id"
              LEFT OUTER JOIN orders O on c.id = O."counter_id"
                    WHERE (c."id" = ?) and c."is_deleted" = false;`;
        var raw2 = bookshelf.knex.raw(sql, [req.body.id]);
        raw2
          .then(function (result) {
            return res.json(Response(constant.statusCode.ok, constant.messages.offerFetchedSuccessfully, result));
          })
          .catch(function (err) {
            console.log(err);
            return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
          });
      }
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getOfferByIdMethod().then((data) => {});
}
function cancelOffer(req, res) {
  async function async_call() {
    try {
      /**
       * Update counters table
       * update ordertable
       * chat table
       * counter_id: data.message.msg.offer_id,
      status: 'accept',
      product_id: data.message.msg.product_id,
      createdbyId: data.message.msg.type_of == 'ask' ? data.message.msg.seller_id : data.message.msg.bidder_id,
      createdForId: data.message.msg.type_of == 'ask' ? data.message.msg.bidder_id : data.message.msg.seller_id,
      chat_id: data.id
       */
      const chat_update = {
        isofferCanceled: true,
        isActionPerformedbyRecieved: true,
      };
      const chat_con = {
        id: req.body.chat_id,
      };
      const coniter_con = {
        id: req.body.counter_id,
      };
      const up_counter = {
        is_deleted: true,
      };
      const orderCon = {
        product_id: req.body.product_id,
        counter_id: req.body.counter_id,
      };
      await common_query.updateRecord(ChatModel, chat_update, chat_con).catch((err) => {
        throw err;
      });
      await common_query.updateRecord(OrderModel, up_counter, orderCon).catch((err) => {
        throw err;
      });
      const fndata = await common_query.updateRecord(CounterModel, up_counter, coniter_con).catch((err) => {
        throw err;
      });
      if (fndata.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.offerAccepted, {}));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  async_call();
}
function acceptOffer(req, res) {
  async function acceptOfferMethod() {
    try {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      newdate = year + '-' + month + '-' + day;

      let data = {
        counter_id: req.body.counter_id ? req.body.counter_id : null,
        status: req.body.status ? req.body.status : null,
        is_deleted: false,
        product_id: req.body.product_id ? req.body.product_id : null,
        createdbyId: req.body.createdbyId ? req.body.createdbyId : null,
        created_at: newdate,
      };
      console.log('req body in accept offer ', req.body);
      updateCounterStatus(req);
      let orderdata = {};
      orderdata = await common_query.saveRecord(OrderModel, data);
      let notObj = {
        created_by: data.createdbyId,
        content: 'accepted your offer',
        destnation_user_id: req.body.createdForId,
      };
      console.log(notObj);
      const condition_chat = {
        o_id: req.body.counter_id.toString(),
        p_id: req.body.product_id.toString(),
      };
      var sql = `select * from chats where message->'msg'->>
      'offer_id'=${"'" + condition_chat.o_id + "'"}
and message->'msg'->>'product_id'=${"'" + condition_chat.p_id + "'"}`;
      // console.log('queryyyyyyyyyyyyyy_______________--', sql)

      bookshelf.knex.raw(sql).then(async (res) => {
        /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
        let updatedata = {
          isActionPerformedbyRecieved: true,
          isofferAccepted: true,
        };

        if (res && res.rows[0] && res.rows[0].id) {
          let condition = {
            id: res.rows[0].id,
          };
          console.log('res = > ' + res);
          // console.log('data.rows[0]data.rows[0]', res.rows[0])
          chat_room_id = res.rows[0].room_id;
          if (res.rows[0].id) {
            const u_chat = await common_query.updateRecord(ChatModel, updatedata, condition);
            console.log('u_chat accept 1233333asunc ', u_chat);
          }
        }
      });

      if (req.body.chat_id) {
        /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
        let updatedata = {
          isActionPerformedbyRecieved: true,
          isofferAccepted: true,
        };
        let condition = {
          id: req.body.chat_id ? req.body.chat_id : chatId,
        };
        const u_chat = await common_query.updateRecord(ChatModel, updatedata, condition);
        console.log('u_chat accept', u_chat);
      }

      utility.addNotification(notObj, function (err, resp) {
        if (err) {
          console.log('Error adding notification in accept offer', err);
        } else {
          console.log('response after calling common add notification in accept offer', resp);
        }
      });

      if (orderdata.code == 200) {
        if (!req.body.chat_id) {
          bookshelf.knex.raw(sql).then(async (data) => {
            // orderdata.chat_room_id = data.rows[0].room_id;
            // console.log('chat_room_id!!!!!!!!!!!!!!!!!', data.rows[0].room_id)
            return res.json(Response(constant.statusCode.ok, constant.messages.offerAccepted, orderdata));
          });
        } else {
          return res.json(Response(constant.statusCode.ok, constant.messages.offerAccepted, orderdata));
        }
      } else {
        console.log('else acceot offer record', orderdata);
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
      }
    } catch (err) {
      console.log('accept offer  catch err===>', err);
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  acceptOfferMethod().then((data) => {});
}

function updateCounterStatus(req) {
  async function updateCounterStatusMethod() {
    let updatedata = {
      status: req.body.status ? req.body.status : null,
    };
    let condition = {
      id: req.body.counter_id,
    };
    await common_query.updateRecord(CounterModel, updatedata, condition);
  }
  updateCounterStatusMethod().then((data) => {});
}

function declineOffer(req, res) {
  async function declineMethod() {
    try {
      console.log('declineOffer', req.body);
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      newdate = year + '-' + month + '-' + day;

      let data = {
        counter_id: req.body.counter_id ? req.body.counter_id : null,
        status: req.body.status ? req.body.status : null,
        is_deleted: false,
        product_id: req.body.product_id ? req.body.product_id : null,
        createdbyId: req.body.createdbyId ? req.body.createdbyId : null,
        created_at: newdate,
      };

      updateCounterStatus(req);
      const condition_chat = {
        o_id: req.body.counter_id.toString(),
        p_id: req.body.product_id.toString(),
      };
      var sql = `select * from chats where message->'msg'->>
      'offer_id'=${"'" + condition_chat.o_id + "'"}
and message->'msg'->>'product_id'=${"'" + condition_chat.p_id + "'"}`;
      // console.log('queryyyyyyyyyyyyyy_______________--', sql)

      bookshelf.knex.raw(sql).then(async (data) => {
        /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
        let updatedata = {
          isActionPerformedbyRecieved: true,
          isofferAccepted: false,
        };
        if (data.rows[0]) {
          let condition = {
            id: data.rows[0].id,
          };
          console.log('data.rows[0]data.rows[0] 434343434343', data.rows[0]);
          chat_room_id = data.rows[0].room_id;
          const u_chat = await common_query.updateRecord(ChatModel, updatedata, condition);
          console.log('u_chat accept 43434343444 ', u_chat);
        }
      });
      if (req.body.chat_id) {
        /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted false */
        let updatedata = {
          isActionPerformedbyRecieved: true,
          isofferAccepted: false,
        };
        let condition = {
          id: req.body.chat_id,
        };
        const u_chat = await common_query.updateRecord(ChatModel, updatedata, condition);
        console.log('u_chat decline', u_chat);
      }
      let orderdata = {};
      orderdata = await common_query.saveRecord(OrderModel, data);
      let notObj = {
        created_by: data.createdbyId,
        content: 'decline your offer',
        destnation_user_id: req.body.createdForId,
      };
      utility.addNotification(notObj, function (err, resp) {
        if (err) {
          console.log('Error adding notification in decline offer', err);
        } else {
          console.log('response after calling common add notification in decline offer', resp);
        }
      });
      if (orderdata.code == 200) {
        if (!req.body.chat_id) {
          bookshelf.knex.raw(sql).then(async (data) => {
            // orderdata.chat_room_id = data.rows[0].room_id;
            // console.log('chat_room_id!!!!!!!!!!!!!!!!!???????????', data.rows[0].room_id)
            return res.json(Response(constant.statusCode.ok, constant.messages.offerDecline, orderdata));
          });
        } else {
          return res.json(Response(constant.statusCode.ok, constant.messages.offerDecline, orderdata));
        }
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
      }
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  declineMethod().then((data) => {});
}

function confirmDelivery(req, res) {
  async function confirmDeliveryMethod() {
    try {
      let updatedata = {
        delivered: req.body.delivered,
      };

      let condition = {
        id: req.body.id,
      };

      let updateUserData = await common_query.updateRecord(OrderModel, updatedata, condition);
      let notObj = {
        created_by: req.body.createdbyId,
        content: 'confirmed delivery for your offer',
        destnation_user_id: req.body.createdForId,
      };
      utility.addNotification(notObj, function (err, resp) {
        if (err) {
          console.log('Error adding notification inc confirm delivery offer', err);
        } else {
          console.log('response after calling common add notification in confirm delivery offer', resp);
        }
      });
      if (updateUserData.code == 200) {
        var sql = `select c.*,O."status",O."createdbyId",O."track_no",O."courier",O."paymentdetail", O."delivered" from counters c
                      LEFT OUTER JOIN orders O on c.id = O."counter_id"
                      WHERE (c."id" = ?) and c."is_deleted" = false;`;
        var raw2 = bookshelf.knex.raw(sql, [req.body.counter_id]);
        raw2.then(function (result) {
          return res.json(Response(constant.statusCode.ok, constant.messages.confirmdelivery, result));
        });
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result));
      }
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  confirmDeliveryMethod().then((data) => {});
}
//get all users
function getAllUsers(req, res) {
  async function getAllUsersMethod() {
    try {
      let limit = req.body.pagePerLimit || 10;
      let page = req.body.currentPage - 1 || 0;
      let isdeleted = req.body.isdeleted;
      let offset = limit * page;
      let columnName = req.body.columnName || 'first_name';
      // let sortingOrder =req.body.sortingOrder + " " + "NULL LAST"|| "ASC NULL LA|| "ASC ";
      let sortingOrder = req.body.sortingOrder || 'ASC';
      if (req.body.sortingOrder == 'NORMAL') {
        sortingOrder = 'ASC';
        columnName = 'first_name';
      }
      let searchChar;
      if (req.body.searchChar) {
        searchChar = `("user_name" ilike '%${req.body.searchChar}%' or "first_name" ilike '%${req.body.searchChar}%' or "last_name" ilike '%${req.body.searchChar}%') and `;
      }
      let sql = `SELECT *, count(*) OVER()
      AS full_count FROM users WHERE ${searchChar ? searchChar : ''}is_deleted=${isdeleted}
       AND ("role"='user' OR "role" IS NULL) ORDER BY "${columnName}" ${sortingOrder} OFFSET ${offset} LIMIT ${limit};`;

      // let sql = `SELECT *, count(*) OVER() AS full_count FROM users WHERE is_deleted=? ORDER BY ${columnName} OFFSET ? LIMIT ?;`
      // bookshelf.knex.raw(sql).then(data => {
      //   return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
      // })
      bookshelf.knex
        .raw(sql)
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getAllUsersMethod().then((data) => {});
}

function exportTransactionList(req, res) {
  async function exportTransactionListMethod() {
    try {
      let sql = `
      Select  P."id" as "Product_id", P."productName" as "Productname", C."type_of" as "Type", CONCAT(S.first_name,' ',S.last_name) as "Seller_name", CONCAT(B.first_name,' ',B.last_name) as "Bidder_name", C."total_amount" as "Amount"
      from orders O
      LEFT OUTER JOIN counters C ON O."counter_id" = C.id
      LEFT OUTER JOIN products P ON O."product_id" = P.id
      LEFT OUTER JOIN images I ON P.id = I."productId"
      LEFT OUTER JOIN users S ON S.id = C."seller_id"
      LEFT OUTER JOIN users B ON B.id = C."bidder_id"
      where O.is_deleted = false and O."status" LIKE '%accept%' and O."track_no" is not NULL and O.delivered = true
      ORDER BY P."productName" ASC
      `;
      bookshelf.knex
        .raw(sql)
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.transactionList, data));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  exportTransactionListMethod().then((data) => {});
}
//get all Transaction List
function getTransactionList(req, res) {
  async function getTransactionListMethod() {
    try {
      let limit = req.body.pagePerLimit || 10;
      let page = req.body.currentPage - 1 || 0;
      let isdeleted = req.body.isdeleted;
      let offset = limit * page;
      let columnName = req.body.columnName || 'productName';
      let sortingOrder = req.body.sortingOrder || 'ASC';
      if (req.body.sortingOrder == 'NORMAL') {
        sortingOrder = 'ASC';
        columnName = 'productName';
      }
      let searchChar;
      if (req.body.searchChar) {
        searchChar = `("productName" ilike '%${req.body.searchChar}%') and `;
      }
      // let sql = `SELECT *, count(*) OVER() AS full_count FROM users WHERE  ${searchChar ? searchChar : ''}is_deleted=${isdeleted} AND ("role"='user' OR "role" IS NULL) ORDER BY "${columnName}" ${sortingOrder} OFFSET ${offset} LIMIT ${limit};`

      let sql = `
      Select O.*,C."type_of", C."total_amount", count(*) OVER() AS full_count, P."productName", I."imageUrl", CONCAT(S.first_name,' ',S.last_name) as "seller_name", CONCAT(B.first_name,' ',B.last_name) as "bidder_name"
      from orders O
      LEFT OUTER JOIN counters C ON O."counter_id" = C.id
      LEFT OUTER JOIN products P ON O."product_id" = P.id
      LEFT OUTER JOIN images I ON P.id = I."productId"
      LEFT OUTER JOIN users S ON S.id = C."seller_id"
      LEFT OUTER JOIN users B ON B.id = C."bidder_id"
      where ${searchChar ? searchChar : ''} O.is_deleted = false and O."status" LIKE '%accept%' and O."track_no" is not NULL and O.delivered = true
      Group By O.id, C."type_of", C."total_amount", P."productName", I."imageUrl", S."first_name", S."last_name", B.first_name, B.last_name
      ORDER BY "${columnName}" ${sortingOrder} OFFSET ${offset} LIMIT ${limit};
      `;
      bookshelf.knex
        .raw(sql)
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.transactionList, data));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getTransactionListMethod().then((data) => {});
}

//get all user details
function userdetails(req, res, next) {
  async function userdetailsMethod() {
    var getDraftListDecryptedResult = [];
    var conditions = {
      'users.id': 34,
    };

    new UserModel()
      .where(conditions)
      .query(_filter)
      .query(function (qb) {
        qb.columns(['users.*', 'images.imageUrl']);
      })
      .fetchAll()
      .then(function (getDraftListResult) {
        getDraftListResult = getDraftListResult.toJSON();
        console.log(getDraftListResult);
        return res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, getDraftListResult));
      })
      .catch(function (err) {
        console.log(err);
        __debug(err);
        res.json({
          status: config.statusCode.error,
          data: [],
          message: i18n.__('INTERNAL_ERROR'),
        });
      });

    function _filter(qb) {
      qb.joinRaw(`LEFT JOIN images ON (users.id = images."userId")`);
    }
  }
  userdetailsMethod().then((data) => {});
}
// function emailVerification(req, res) {
//   async function async_call() {
//     try {

//     } catch (error) {
//       return res.json(Response(constant.statusCode.internalError))
//     }
//   } async_call()
// }

// Varun created WatchList feature (10-04-2020)
function AddWatchList(req, res) {
  async function saveWatchListMethod() {
    try {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      newdate = year + '-' + month + '-' + day;

      var userId = parseInt(req.body.userId);
      var productId = parseInt(req.body.productId);

      let sql = `select * from watchlists where "user_id"=${userId} and "product_id"=${productId};`;
      let watchlistData = await bookshelf.knex.raw(sql);
      let array1 = watchlistData.rows;
      var watchRecord = [];
      array1.forEach((element) => {
        let output = JSON.stringify(element);
        let output1 = JSON.parse(output);
        watchRecord.push(output1);
      });
      console.log(watchRecord[0]);
      if (watchlistData.rowCount > 0) {
        let updatedata = {
          updated_at: newdate,
          status: watchRecord[0].status == 1 ? 0 : 1,
        };
        let condition = {
          id: watchRecord[0].id,
        };

        let updateWatchListData = await common_query.updateRecord(WatchListModel, updatedata, condition);
        console.log(updateWatchListData.success);
        if (updateWatchListData.code == 200) {
          return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateWatchListData.success));
        } else {
          return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
        }
      } else {
        let watchlistdata = {
          user_id: userId ? userId : null,
          product_id: productId ? productId : null,
          status: 1,
          created_at: newdate,
          updated_at: newdate,
        };
        let saveWatchListData = await common_query.saveRecord(WatchListModel, watchlistdata);
        console.log(saveWatchListData);
        if (saveWatchListData.code == 200) {
          return res.json(Response(constant.statusCode.ok, constant.messages.Registration, saveWatchListData.success));
        } else {
          return res.json(Response(constant.statusCode.internalError, constant.validateMsg.internalError));
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  saveWatchListMethod().then((data) => {});
}

function getWatchListData(req, res) {
  async function getWatchListMethod() {
    try {
      var userId = parseInt(req.body.userId);
      var productId = parseInt(req.body.productId);

      let sql = `select * from watchlists where "user_id"=${userId} and "product_id"=${productId};`;
      let watchlistData = await bookshelf.knex.raw(sql);
      let array1 = watchlistData.rows;
      var watchRecord = [];
      array1.forEach((element) => {
        let output = JSON.stringify(element);
        let output1 = JSON.parse(output);
        watchRecord.push(output1);
      });
      if (watchlistData.rowCount > 0) {
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, watchRecord[0]));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
      }
    } catch (err) {
      console.log(err);
    }
  }
  getWatchListMethod().then((data) => {});
}

function getAllWatchListData(req, res) {
  async function getAllWatchListMethod() {
    try {
      var userId = parseInt(req.body.userId);
      let sql = `Select P.*,I."imageUrl", MIN(a.amount) as BoxLowestAsk, MAX(b.amount) as BoxHighestBid , MIN(c.amount) as CaseLowestAsk, MAX(d.amount) as CaseHighestBid from watchlists as wl left join products as P on wl.product_id=P.id
      LEFT OUTER JOIN images I on P.id = I."productId"
      LEFT OUTER JOIN bid_and_ask a on P.id = a."productId" and a."request" = 'asks' and a."type"='Box' and a.isdeleted = false and a.isactive = false
      LEFT OUTER JOIN bid_and_ask b on P.id = b."productId" and b."request" = 'bids' and b."type"='Box' and b.isdeleted = false and b.isactive = false
      LEFT OUTER JOIN bid_and_ask c on P.id = c."productId" and c."request" = 'asks' and c."type"='Case' and c.isdeleted = false and c.isactive = false
      LEFT OUTER JOIN bid_and_ask d on P.id = d."productId" and d."request" = 'bids' and d."type"='Case'  and d.isdeleted = false and d.isactive = false
      LEFT OUTER JOIN bid_and_ask t on P.id = t."productId" and t.isdeleted = false
       where wl."user_id"=${userId} AND wl.status=1 AND P."isdeleted"= false GROUP BY t."productId", P.id ,P."productName" ,a."request" , b."request" ,a."type",b."type",i."imageUrl",c."request",d."request",c."type",d."type"
       ORDER BY P."productName"`;
      let watchlistData = await bookshelf.knex.raw(sql);
      let array1 = watchlistData.rows;
      var watchRecord = [];
      array1.forEach((element) => {
        let output = JSON.stringify(element);
        let output1 = JSON.parse(output);
        watchRecord.push(output1);
      });

      if (watchlistData.rowCount > 0) {
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, watchRecord));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
      }
    } catch (err) {
      console.log(err);
    }
  }
  getAllWatchListMethod().then((data) => {});
}

// GET ALL ADMIN USER
function getAllAdminUsers(req, res) {
  async function getAllAdminUsersMethod() {
    try {
      let limit = req.body.pagePerLimit || 10;
      let page = req.body.currentPage - 1 || 0;
      let isdeleted = req.body.isdeleted;
      let offset = limit * page;
      let columnName = req.body.columnName || 'first_name';
      let sortingOrder = req.body.sortingOrder || 'ASC';
      if (req.body.sortingOrder == 'NORMAL') {
        sortingOrder = 'ASC';
        columnName = 'first_name';
      }
      let searchChar;
      if (req.body.searchChar) {
        searchChar = `("first_name" ilike '%${req.body.searchChar}%' or "last_name" ilike '%${req.body.searchChar}%') and `;
      }
      let sql = `SELECT *, count(*) OVER() AS full_count FROM users WHERE ${
        searchChar ? searchChar : ''
      }is_deleted=${isdeleted} and role='admin' ORDER BY "${columnName}" ${sortingOrder} OFFSET ${offset} LIMIT ${limit};`;

      // let sql = `SELECT *, count(*) OVER() AS full_count FROM users WHERE is_deleted=? ORDER BY ${columnName} OFFSET ? LIMIT ?;`
      // bookshelf.knex.raw(sql).then(data => {
      //   return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
      // })
      bookshelf.knex
        .raw(sql)
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getAllAdminUsersMethod().then((data) => {});
}
// To add Notification by Saurabh 16/5/2020
function addNotification(req, res) {
  async function addNotification() {
    try {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      newdate = year + '-' + month + '-' + day;

      let data = {
        created_by: req.body.created_by ? req.body.created_by : null,
        content: req.body.content ? req.body.content : null,
        destnation_user_id: req.body.destnation_user_id ? req.body.destnation_user_id : null,
        is_deleted: false,
        is_read: false,
      };
      let notificationdata = await common_query.saveRecord(NotificationModel, data);

      if (notificationdata.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.notificationAddSuccess, orderdata));
      } else {
        console.log('else in notification data', orderdata);
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
      }
    } catch (err) {
      console.log('add notification catch err===>', err);
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  addNotification().then((data) => {});
}

// To get notification by user id By Saurabh 16/5/2020
function getNotificationByUserId(req, res) {
  async function getNotificationByUserId() {
    console.log('get notification function calling at backend*******', req.body);
    try {
      if (req.body && req.body.loggedUser) {
        var userId = parseInt(req.body.loggedUser);
        console.log('req.body in get notificatins====>', req.body.loggedUser);
        let limit = req.body.pagePerLimit || 10;
        let page = req.body.currentPage - 1 || 0;
        let is_read = req.body.is_read || 'false';
        let offset = limit * page;
        let columnName = req.body.columnName || 'created_at';
        let sortingOrder = req.body.sortingOrder || 'DESC';
        if (req.body.sortingOrder == 'NORMAL') {
          sortingOrder = 'DESC';
          columnName = 'created_at';
        }
        if (req.body.is_read == 'all') {
          var sql = `select n.*,count(*) OVER() AS full_count,u.first_name as sendby_firstname,u.last_name as sentby_lastname from notifications n LEFT OUTER JOIN users u on u.id = n."created_by" where n."is_deleted"=false  and n."destnation_user_id"=${userId} ORDER BY "${columnName}" ${sortingOrder} OFFSET ${offset} LIMIT ${limit}`;
        } else {
          var sql = `select n.*,count(*) OVER() AS full_count,u.first_name as sendby_firstname,u.last_name as sentby_lastname from notifications n LEFT OUTER JOIN users u on u.id = n."created_by" where n."is_deleted"=false and n."is_read"=${is_read} and n."destnation_user_id"=${userId} ORDER BY "${columnName}" ${sortingOrder} OFFSET ${offset} LIMIT ${limit}`;
        }

        var countsql = `select * from notifications where destnation_user_id =${userId} and is_deleted =false and is_read=false;`;

        var raw2 = bookshelf.knex.raw(sql);
        // console.log('query result in get notificatins=====>', raw2)
        raw2
          .then(function (result) {
            var countquery = bookshelf.knex.raw(countsql);
            countquery
              .then(function (countresult) {
                var totalCount = countresult.rowCount;
                console.log('Total unread count is====', totalCount);
                result.totalNotifiCount = totalCount;
                return res.json(Response(constant.statusCode.ok, constant.messages.notificationFetchedSuccess, result));
              })
              .catch(function (err) {
                console.log(err);
                return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.commonError));
              });
          })
          .catch(function (err) {
            console.log(err);
            return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.commonError));
          });
      }
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getNotificationByUserId().then((data) => {});
}
// To mark notification as read by Saurabh 16/5/2020
function readNotification(req, res) {
  async function readNotification() {
    let updatedata = {
      is_read: true,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(NotificationModel, updatedata, condition);
    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.notificationReadSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  readNotification().then((data) => {});
}
// To delete notification by Saurabh 16/5/2020
function deleteNotification(req, res) {
  async function deleteNotification() {
    let updatedata = {
      is_deleted: true,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(NotificationModel, updatedata, condition);
    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.notificationDeleteSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  deleteNotification().then((data) => {});
}
