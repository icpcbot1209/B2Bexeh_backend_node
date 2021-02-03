'use strict';

function _typeof(obj) {
  if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj;
    };
  }
  return _typeof(obj);
}

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

var s3file_upload = require('../../../../../utils/fileUpload'); // var AddressModel = loader.loadModel('/address/models/address_models');

var jwt = require('jsonwebtoken'); // var MetricesSettingProviderModel = loader.loadModel('/metrices_setting_provider/models/metrices_setting_provider_model');
// var MetricesSettingModel = loader.loadModel('/metrices_setting/models/metrices_setting_model');

var constant = require('../../../../../utils/constants');

var common_query = require('../../../../../utils/commonQuery');

var Response = require('../../../../../utils/response');

var uuidv4 = require('uuid/v4');

var utility = require('../../../../../utils/utility');

var nodemailer = require('nodemailer');

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
  getActiveOfferByUserId: getActiveOfferByUserId,
  getActiveRecievedByUserId: getActiveRecievedByUserId,
  getAcceptOfferByUserId: getAcceptOfferByUserId,
  statusChange: statusChange,
  sendContactUs: sendContactUs,
  getPendingOfferByUserId: getPendingOfferByUserId,
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
  function statusChangeMethod() {
    var updatedata, condition, _updateUserData;

    return regeneratorRuntime.async(
      function statusChangeMethod$(_context) {
        while (1) {
          switch ((_context.prev = _context.next)) {
            case 0:
              updatedata = {
                is_active: req.body.is_active ? req.body.is_active : null,
              };
              condition = {
                id: req.body.id,
              };
              _context.prev = 2;
              _context.next = 5;
              return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, updatedata, condition));

            case 5:
              _updateUserData = _context.sent;

              if (!(_updateUserData.code == 200)) {
                _context.next = 10;
                break;
              }

              return _context.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, _updateUserData)));

            case 10:
              return _context.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError)));

            case 11:
              _context.next = 16;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context['catch'](2);
              return _context.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError)));

            case 16:
            case 'end':
              return _context.stop();
          }
        }
      },
      null,
      null,
      [[2, 13]]
    );
  }

  statusChangeMethod().then(function (data) {});
}

function getLastThreeTransaction(req, res) {
  function getLastThreeTransactionMethod() {
    var sql;
    return regeneratorRuntime.async(
      function getLastThreeTransactionMethod$(_context2) {
        while (1) {
          switch ((_context2.prev = _context2.next)) {
            case 0:
              _context2.prev = 0;

              if (req.body && req.body.limit) {
                sql = 'Select O.id, O."created_at",C."type_of",C."type", C."amount", C."qty", P."productName"\n        from orders O\n        LEFT OUTER JOIN counters C ON O."counter_id" = C.id\n        LEFT OUTER JOIN products P ON O."product_id" = P.id\n        where O.is_deleted = false and O.product_id ='
                  .concat(
                    req.body.product_id,
                    ' and O."status" LIKE \'%accept%\' and O."track_no" is not NULL and O.delivered = true\n        Group By O.id, C."type_of", C."total_amount", C."amount",C."qty", P."productName", C."type"\n        order by id desc limit '
                  )
                  .concat(req.body.limit);
              } else {
                sql = 'Select O.id, O."created_at",C."type_of",C."type", C."amount", C."qty", P."productName"\n        from orders O\n        LEFT OUTER JOIN counters C ON O."counter_id" = C.id\n        LEFT OUTER JOIN products P ON O."product_id" = P.id\n        where O.is_deleted = false and O.product_id ='.concat(
                  req.body.product_id,
                  ' and O."status" LIKE \'%accept%\' and O."track_no" is not NULL and O.delivered = true\n        Group By O.id, C."type_of", C."total_amount", C."amount",C."qty", P."productName", C."type"\n        order by O."created_at" desc'
                );
              }

              bookshelf.knex
                .raw(sql)
                .then(function (data) {
                  return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, data.rows));
                })
                ['catch'](function (err) {
                  return res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound));
                });
              _context2.next = 8;
              break;

            case 5:
              _context2.prev = 5;
              _context2.t0 = _context2['catch'](0);
              return _context2.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 8:
            case 'end':
              return _context2.stop();
          }
        }
      },
      null,
      null,
      [[0, 5]]
    );
  }

  getLastThreeTransactionMethod().then(function (data) {});
} // function getTxnHistory(req, res) {
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
  function getTxnHistoryMethod() {
    var _result, sql, sql1, sql11, sql2, sql21, sql3, sql31;

    return regeneratorRuntime.async(
      function getTxnHistoryMethod$(_context3) {
        while (1) {
          switch ((_context3.prev = _context3.next)) {
            case 0:
              _context3.prev = 0;
              _result = {
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
              sql = 'select * from transaction_history where "userId"= '.concat(req.body.userId, ' and "is_deleted"=false;');
              _context3.next = 5;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sql)
                  .then(function (data) {
                    _result.total_txn_lifetime = data.rows.length ? data.rows[0].total_txn_lifetime : 0;
                  })
                  ['catch'](function (err) {
                    return console.log('Error1===', err);
                  })
              );

            case 5:
              sql1 = 'select * from orders o left outer join counters C on c.id =o.counter_id where C.bidder_id ='.concat(
                req.body.userId,
                '\n  and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL \'90 days\' and o."paymentdetail" is not NULL;'
              );
              _context3.next = 8;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sql1)
                  .then(function (data) {
                    _result.total_txn_ninty_days1 = data.rows.length;
                    console.log('3 months data 1', data.rows.length);
                  })
                  ['catch'](function (err) {
                    return console.log('Error2===', err);
                  })
              );

            case 8:
              sql11 = 'select * from orders o left outer join counters C on c.id =o.counter_id where C.seller_id ='.concat(
                req.body.userId,
                '\n  and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL \'90 days\' and o."track_no" is not NULL;'
              );
              _context3.next = 11;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sql11)
                  .then(function (data) {
                    _result.total_txn_ninty_days2 = data.rows.length;
                    _result.total_txn_ninty_days = _result.total_txn_ninty_days1 + _result.total_txn_ninty_days2;
                    console.log('3 months data 2', _result.total_txn_ninty_days);
                  })
                  ['catch'](function (err) {
                    return console.log('Error2===', err);
                  })
              );

            case 11:
              sql2 = 'select * from orders o left outer join counters C on c.id =o.counter_id where C.bidder_id ='.concat(
                req.body.userId,
                '\n  and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL \'180 days\' and o."paymentdetail" is not NULL;'
              );
              _context3.next = 14;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sql2)
                  .then(function (data) {
                    _result.total_txn_six_month1 = data.rows.length;
                  })
                  ['catch'](function (err) {
                    return console.log('Error3===', err);
                  })
              );

            case 14:
              sql21 = 'select * from orders o left outer join counters C on c.id =o.counter_id where C.seller_id ='.concat(
                req.body.userId,
                '\n          and C."is_deleted"=false and DATE(C."created_at") >= DATE(NOW()) - INTERVAL \'180 days\' and o."track_no" is not NULL;'
              );
              _context3.next = 17;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sql21)
                  .then(function (data) {
                    _result.total_txn_six_month2 = data.rows.length;
                    _result.total_txn_six_month = _result.total_txn_six_month1 + _result.total_txn_six_month2;
                  })
                  ['catch'](function (err) {
                    return console.log('Error3===', err);
                  })
              );

            case 17:
              sql3 = 'select * from orders o left outer join counters C on c.id =o.counter_id where C.bidder_id ='.concat(
                req.body.userId,
                '\n          and C."is_deleted"=false  and o."paymentdetail" is not NULL;'
              );
              _context3.next = 20;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sql3)
                  .then(function (data) {
                    _result.total_txn_lifetime_count1 = data.rows.length;
                  })
                  ['catch'](function (err) {
                    return console.log('Error4===', err);
                  })
              );

            case 20:
              sql31 = 'select * from orders o left outer join counters C on c.id =o.counter_id where C.seller_id ='.concat(
                req.body.userId,
                '\n          and C."is_deleted"=false and o."track_no" is not NULL; '
              );
              _context3.next = 23;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sql31)
                  .then(function (data) {
                    _result.total_txn_lifetime_count2 = data.rows.length;
                    _result.total_txn_lifetime_count = _result.total_txn_lifetime_count1 + _result.total_txn_lifetime_count2;
                  })
                  ['catch'](function (err) {
                    return console.log('Error4===', err);
                  })
              );

            case 23:
              console.log('resultttttttttttttttttttt', _result);
              return _context3.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, _result)));

            case 27:
              _context3.prev = 27;
              _context3.t0 = _context3['catch'](0);
              return _context3.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 30:
            case 'end':
              return _context3.stop();
          }
        }
      },
      null,
      null,
      [[0, 27]]
    );
  }

  getTxnHistoryMethod().then(function (data) {});
}

function saveTxnHistory(req, res) {
  function saveTxnHistoryMethod() {
    var sql, TxnHistoryData, array1, txnHistoryRecord, dateObj, month, day, year, updatedata, condition, updateTxnHistoryData, data, _updateUserData2;

    return regeneratorRuntime.async(
      function saveTxnHistoryMethod$(_context4) {
        while (1) {
          switch ((_context4.prev = _context4.next)) {
            case 0:
              _context4.prev = 0;
              sql = 'select * from transaction_history where "userId"='.concat(req.body.userId, ' and "is_deleted"=false;');
              _context4.next = 4;
              return regeneratorRuntime.awrap(bookshelf.knex.raw(sql));

            case 4:
              TxnHistoryData = _context4.sent;
              array1 = TxnHistoryData.rows;
              txnHistoryRecord = [];
              array1.forEach(function (element) {
                var output = JSON.stringify(element);
                var output1 = JSON.parse(output);
                txnHistoryRecord.push(output1);
              });
              dateObj = new Date();
              month = dateObj.getUTCMonth() + 1; //months from 1-12

              day = dateObj.getUTCDate();
              year = dateObj.getUTCFullYear();
              newdate = year + '-' + month + '-' + day;

              if (!(TxnHistoryData.rowCount > 0)) {
                _context4.next = 26;
                break;
              }

              updatedata = {
                total_txn_lifetime: req.body.total_txn_lifetime ? req.body.total_txn_lifetime : null,
                userId: req.body.userId ? req.body.userId : null,
                is_deleted: false,
                updatedAt: newdate,
              }; // total_txn_six_month: req.body.total_txn_six_month ? req.body.total_txn_six_month : null,
              // total_txn_ninty_days: req.body.total_txn_ninty_days ? req.body.total_txn_ninty_days : null,
              // expire_offer: req.body.expire_offer ? req.body.expire_offer : null,
              // offer_acceptance: req.body.offer_acceptance ? req.body.offer_acceptance : null,

              condition = {
                id: txnHistoryRecord[0].id,
              };
              _context4.next = 18;
              return regeneratorRuntime.awrap(common_query.updateRecord(TxnHistoryModel, updatedata, condition));

            case 18:
              updateTxnHistoryData = _context4.sent;

              if (!(updateTxnHistoryData.code == 200)) {
                _context4.next = 23;
                break;
              }

              return _context4.abrupt(
                'return',
                res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateTxnHistoryData.success))
              );

            case 23:
              return _context4.abrupt(
                'return',
                res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
              );

            case 24:
              _context4.next = 35;
              break;

            case 26:
              data = {
                total_txn_lifetime: req.body.total_txn_lifetime ? req.body.total_txn_lifetime : null,
                userId: req.body.userId ? req.body.userId : null,
                is_deleted: false,
                createdAt: newdate,
                updatedAt: newdate,
              };
              _context4.next = 29;
              return regeneratorRuntime.awrap(common_query.saveRecord(TxnHistoryModel, data));

            case 29:
              _updateUserData2 = _context4.sent;

              if (!(_updateUserData2.code == 200)) {
                _context4.next = 34;
                break;
              }

              return _context4.abrupt(
                'return',
                res.json(Response(constant.statusCode.ok, constant.messages.TxnsubmittedSuccessfully, _updateUserData2))
              );

            case 34:
              return _context4.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError)));

            case 35:
              _context4.next = 40;
              break;

            case 37:
              _context4.prev = 37;
              _context4.t0 = _context4['catch'](0);
              return _context4.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError)));

            case 40:
            case 'end':
              return _context4.stop();
          }
        }
      },
      null,
      null,
      [[0, 37]]
    );
  }

  saveTxnHistoryMethod().then(function (data) {});
}

function saveEmailBlast(req, res) {
  function saveEmailBlastUserMethod() {
    var dateObj, month, day, year, roomId, data, _updateUserData3;

    return regeneratorRuntime.async(
      function saveEmailBlastUserMethod$(_context8) {
        while (1) {
          switch ((_context8.prev = _context8.next)) {
            case 0:
              _context8.prev = 0;
              dateObj = new Date();
              month = dateObj.getUTCMonth() + 1; //months from 1-12

              day = dateObj.getUTCDate();
              year = dateObj.getUTCFullYear();
              newdate = year + '-' + month + '-' + day;
              data = {
                is_deleted: false,
                subject: req.body.subject ? req.body.subject : null,
                message: req.body.message ? req.body.message : null,
                user: req.body.user ? req.body.user : null,
                createdBy: req.body.userId ? req.body.userId : null,
                createdAt: newdate,
              };
              _context8.next = 9;
              return regeneratorRuntime.awrap(common_query.saveRecord(EmailBlastModel, data));

            case 9:
              _updateUserData3 = _context8.sent;

              if (!(_updateUserData3.code == 200)) {
                _context8.next = 15;
                break;
              }

              req.body.user.forEach(function _callee3(element) {
                var notObj,
                  _data,
                  inRoom,
                  rmCondition,
                  update_rm,
                  contact_chat_condition,
                  contactInfo,
                  _data2,
                  saveRoom,
                  resp,
                  _data3,
                  c2,
                  data1,
                  c1,
                  message,
                  chatData;

                return regeneratorRuntime.async(function _callee3$(_context7) {
                  while (1) {
                    switch ((_context7.prev = _context7.next)) {
                      case 0:
                        if (!(element.id != req.body.userId)) {
                          _context7.next = 54;
                          break;
                        }

                        notObj = {
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
                        _data = {
                          user_id1: req.body.userId,
                          user_id2: element.id,
                          status: true,
                          created_at: ''.concat(moment().utc().format('YYYY-MM-DD')),
                          updated_at: ''.concat(moment().utc().format('YYYY-MM-DD')),
                        };
                        _context7.next = 6;
                        return regeneratorRuntime.awrap(
                          bookshelf.knex.raw(
                            'select\n"id" from rooms where ("user_id1"= \''
                              .concat(req.body.userId, '\' and "user_id2"= \'')
                              .concat(element.id, '\') or\n("user_id2"= \'')
                              .concat(req.body.userId, '\' and "user_id1"= \'')
                              .concat(element.id, "');")
                          )
                        );

                      case 6:
                        inRoom = _context7.sent;

                        if (!inRoom.rowCount) {
                          _context7.next = 31;
                          break;
                        }

                        console.log('2');
                        rmCondition = {
                          id: inRoom.rows[0].id,
                        };
                        roomId = inRoom.rows[0].id;
                        update_rm = {
                          status: true,
                          updated_at: ''.concat(moment().utc().format('YYYY-MM-DD')),
                        };
                        _context7.next = 14;
                        return regeneratorRuntime.awrap(
                          common_query.updateRecord(roomModel, update_rm, rmCondition)['catch'](function (err) {
                            throw err;
                          })
                        );

                      case 14:
                        contact_chat_condition = {
                          room_id: inRoom.rows[0].id,
                          my_id: req.body.userId,
                          my_contact_id: element.id,
                        };
                        console.log('data contact_chat_condition id in line number 312', contact_chat_condition);
                        _context7.next = 18;
                        return regeneratorRuntime.awrap(
                          common_query.findAllData(contactModel, contact_chat_condition)['catch'](function (err) {
                            throw err;
                          })
                        );

                      case 18:
                        contactInfo = _context7.sent;
                        console.log('data contact id in line number 317', contactInfo.data.toJSON());

                        if (!contactInfo.data.toJSON().length) {
                          _context7.next = 26;
                          break;
                        }

                        contactInfo = contactInfo.data.toJSON();
                        contact_id_for_chat = contactInfo[0].id;
                        console.log('data contact id in line number 318', contact_id_for_chat);
                        _context7.next = 29;
                        break;

                      case 26:
                        _data2 = {
                          my_id: req.body.userId,
                          my_contact_id: element.id,
                          isblocked: false,
                          created_at: ''.concat(moment().utc().format('YYYY-MM-DD')),
                          updated_at: ''.concat(moment().utc().format('YYYY-MM-DD')),
                          room_id: inRoom.rows[0].id,
                        };
                        _context7.next = 29;
                        return regeneratorRuntime.awrap(
                          common_query
                            .saveRecord(contactModel, _data2)
                            ['catch'](function (err) {
                              throw err;
                            })
                            .then(function _callee(data) {
                              var contact_chat_condition, contactInfo;
                              return regeneratorRuntime.async(function _callee$(_context5) {
                                while (1) {
                                  switch ((_context5.prev = _context5.next)) {
                                    case 0:
                                      console.log('datata in line number 335');
                                      contact_chat_condition = {
                                        room_id: inRoom.rows[0].id,
                                        my_id: req.body.userId,
                                        my_contact_id: element.id,
                                      };
                                      console.log('datata in line number 343', contact_chat_condition);
                                      _context5.next = 5;
                                      return regeneratorRuntime.awrap(
                                        common_query.findAllData(contactModel, contact_chat_condition)['catch'](function (err) {
                                          throw err;
                                        })
                                      );

                                    case 5:
                                      contactInfo = _context5.sent;
                                      console.log('datata in line number 349', contactInfo.data);
                                      contactInfo = contactInfo.data.toJSON();
                                      contact_id_for_chat = contactInfo[0].id;
                                      console.log('data contact id in line number 348', contact_id_for_chat);

                                    case 10:
                                    case 'end':
                                      return _context5.stop();
                                  }
                                }
                              });
                            })
                        );

                      case 29:
                        _context7.next = 50;
                        break;

                      case 31:
                        console.log('datadatadatadata', _data);
                        _context7.next = 34;
                        return regeneratorRuntime.awrap(
                          common_query.saveRecord(roomModel, _data)['catch'](function (err) {
                            throw err;
                          })
                        );

                      case 34:
                        saveRoom = _context7.sent;
                        console.log('saveRoomsaveRoom', saveRoom.success.toJSON());
                        resp = saveRoom.success.toJSON();

                        if (!saveRoom) {
                          _context7.next = 49;
                          break;
                        }

                        _data3 = {
                          my_id: req.body.userId,
                          my_contact_id: element.id,
                          isblocked: false,
                          created_at: ''.concat(moment().utc().format('YYYY-MM-DD')),
                          updated_at: ''.concat(moment().utc().format('YYYY-MM-DD')),
                          room_id: resp.id,
                        };
                        roomId = resp.id;
                        _context7.next = 42;
                        return regeneratorRuntime.awrap(
                          common_query
                            .saveRecord(contactModel, _data3)
                            ['catch'](function (err) {
                              throw err;
                            })
                            .then(function _callee2(data) {
                              var contact_chat_condition, contactInfo;
                              return regeneratorRuntime.async(function _callee2$(_context6) {
                                while (1) {
                                  switch ((_context6.prev = _context6.next)) {
                                    case 0:
                                      console.log('datata in line number 335');
                                      contact_chat_condition = {
                                        room_id: resp.id,
                                        my_id: req.body.userId,
                                        my_contact_id: element.id,
                                      };
                                      _context6.next = 4;
                                      return regeneratorRuntime.awrap(
                                        common_query.findAllData(contactModel, contact_chat_condition)['catch'](function (err) {
                                          throw err;
                                        })
                                      );

                                    case 4:
                                      contactInfo = _context6.sent;
                                      contactInfo = contactInfo.data.toJSON();
                                      contact_id_for_chat = contactInfo[0].id;
                                      console.log('data contact id in line number 348', contact_id_for_chat);

                                    case 8:
                                    case 'end':
                                      return _context6.stop();
                                  }
                                }
                              });
                            })
                        );

                      case 42:
                        c2 = _context7.sent;
                        data1 = {
                          my_contact_id: req.body.userId,
                          my_id: element.id,
                          isblocked: false,
                          created_at: ''.concat(moment().utc().format('YYYY-MM-DD')),
                          updated_at: ''.concat(moment().utc().format('YYYY-MM-DD')),
                          room_id: resp.id,
                        };
                        _context7.next = 46;
                        return regeneratorRuntime.awrap(
                          common_query.saveRecord(contactModel, data1)['catch'](function (err) {
                            throw err;
                          })
                        );

                      case 46:
                        c1 = _context7.sent;
                        _context7.next = 50;
                        break;

                      case 49:
                        return _context7.abrupt('return', res.json(Response(constant.statusCode.internalError, constant.messages.commonError, null)));

                      case 50:
                        message = {
                          msg: {
                            subject: req.body.subject,
                            message: req.body.message,
                          },
                        };
                        chatData = {
                          my_id: parseInt(req.body.userId),
                          room_id: parseInt(roomId),
                          contact_id: parseInt(element.id),
                          message: message,
                          type: 'email',
                          date_to_group: ''.concat(moment().utc().format('YYYY-MM-DD')),
                          created_at: ''.concat(moment().utc().format('YYYY-MM-DD HH:mm:ss')),
                          updated_at: ''.concat(moment().utc().format('YYYY-MM-DD HH:mm:ss')),
                          isdelete: false,
                          isActionPerformedbySender: false,
                          isActionPerformedbyRecieved: false,
                          isofferAccepted: false,
                          isofferCanceled: false,
                          isofferExpired: false,
                        };
                        _context7.next = 54;
                        return regeneratorRuntime.awrap(common_query.saveRecord(ChatModel, chatData));

                      case 54:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                });
              });
              return _context8.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.EmailBlastedSuccess, _updateUserData3)));

            case 15:
              return _context8.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError)));

            case 16:
              _context8.next = 21;
              break;

            case 18:
              _context8.prev = 18;
              _context8.t0 = _context8['catch'](0);
              return _context8.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError)));

            case 21:
            case 'end':
              return _context8.stop();
          }
        }
      },
      null,
      null,
      [[0, 18]]
    );
  }

  saveEmailBlastUserMethod().then(function (data) {});
}

function sendContactUs(req, res) {
  function sendContactUsMethod() {
    var cond, getStatus, finalData, admindata, title, sendData;
    return regeneratorRuntime.async(
      function sendContactUsMethod$(_context9) {
        while (1) {
          switch ((_context9.prev = _context9.next)) {
            case 0:
              _context9.prev = 0;
              cond = {
                isdeleted: false,
                settingname: 'emailsetting',
              };
              _context9.next = 4;
              return regeneratorRuntime.awrap(common_query.findAllData(settingModel, cond));

            case 4:
              getStatus = _context9.sent;
              finalData = getStatus.data.toJSON();

              if (!(getStatus.code == 200)) {
                _context9.next = 14;
                break;
              }

              admindata = finalData[0].settingvalue;
              title = req.body.name + '- Contact Us Notification ';
              sendData = {
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
              return _context9.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.Submit, {})));

            case 14:
              return _context9.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, {})));

            case 15:
              _context9.next = 20;
              break;

            case 17:
              _context9.prev = 17;
              _context9.t0 = _context9['catch'](0);
              return _context9.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError)));

            case 20:
            case 'end':
              return _context9.stop();
          }
        }
      },
      null,
      null,
      [[0, 17]]
    );
  }

  sendContactUsMethod().then(function (data) {});
}

function getAcceptOfferByUserId(req, res) {
  function getAcceptOfferByUserId() {
    var ask, bid, temp, temp1, i, j, _ret;

    return regeneratorRuntime.async(
      function getAcceptOfferByUserId$(_context11) {
        while (1) {
          switch ((_context11.prev = _context11.next)) {
            case 0:
              _context11.prev = 0;
              _context11.next = 3;
              return regeneratorRuntime.awrap(
                (function _callee4() {
                  var result,
                    groupbyAsk,
                    groupbyBid,
                    groupbyAsksql,
                    groupbyBidsql,
                    _iteratorNormalCompletion,
                    _didIteratorError,
                    _iteratorError,
                    _iterator,
                    _step,
                    eachobj,
                    create,
                    _iteratorNormalCompletion2,
                    _didIteratorError2,
                    _iteratorError2,
                    _iterator2,
                    _step2,
                    _eachobj,
                    _create;

                  return regeneratorRuntime.async(
                    function _callee4$(_context10) {
                      while (1) {
                        switch ((_context10.prev = _context10.next)) {
                          case 0:
                            result = {
                              acceptAsk: [],
                              acceptBid: [],
                            };
                            groupbyAsk = [];
                            groupbyBid = [];
                            groupbyAsksql = 'select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id\n      from counters where seller_id='.concat(
                              req.body.loggedUser,
                              " and type_of_offer='Accept' and is_deleted='false'\n      and type_of='ask' and expiry_date > now() AT TIME ZONE 'UTC'\n      group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id ;"
                            );
                            _context10.next = 6;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex.raw(groupbyAsksql).then(function (data) {
                                groupbyAsk.push(data.rows);
                              })
                            );

                          case 6:
                            groupbyBidsql = 'select created_at,product_id,expiry_day,seller_id,bid_and_ask_id\n      from counters where bidder_id='.concat(
                              req.body.loggedUser,
                              " and type_of_offer='Accept' and is_deleted='false'\n      and type_of='bid' and expiry_date > now() AT TIME ZONE 'UTC'\n      group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id ;"
                            );
                            _context10.next = 9;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex.raw(groupbyBidsql).then(function (data) {
                                groupbyBid.push(data.rows);
                              })
                            );

                          case 9:
                            if (!(groupbyBid[0].length > 0)) {
                              _context10.next = 38;
                              break;
                            }

                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context10.prev = 13;
                            _iterator = groupbyBid[0][Symbol.iterator]();

                          case 15:
                            if ((_iteratorNormalCompletion = (_step = _iterator.next()).done)) {
                              _context10.next = 24;
                              break;
                            }

                            eachobj = _step.value;
                            create = ''.concat(moment(eachobj.created_at).format('YYYY-MM-DD'));
                            sqlbid = 'select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",\n          s.user_name as sellerusername,b.user_name as bidderusername,\n          s.first_name as sellerFirst,p."productName" as product_name,s.company_logo as companylogo,b.company_logo as b_companylogo,\n                s.last_name as sellerLast,b.first_name as bidderFirst,b.last_name as bidderLast,O.id as order_id,O."status",O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c\n                LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n                LEFT OUTER JOIN images i on i."productId" = c."product_id"\n                LEFT OUTER JOIN users s on s.id = c."seller_id"\n                LEFT OUTER JOIN users b on b.id = c."bidder_id"\n                LEFT OUTER JOIN products p on p.id = c."product_id"\n                LEFT OUTER JOIN orders O on c.id = O."counter_id"\n                where c."created_at"=\''
                              .concat(create, '\' and c."seller_id"=')
                              .concat(eachobj.seller_id, ' and c."expiry_day"=')
                              .concat(eachobj.expiry_day, '\n                 and c."product_id"=')
                              .concat(eachobj.product_id, " and type_of='bid' and c.bidder_id=")
                              .concat(
                                req.body.loggedUser,
                                "\n                 and c.type_of_offer='Accept' and c.is_deleted='false'\n                 and c.type_of='bid' and c.expiry_date > now() AT TIME ZONE 'UTC'\n                 and c.\"bid_and_ask_id\"="
                              )
                              .concat(eachobj.bid_and_ask_id, '; ');
                            _context10.next = 21;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex
                                .raw(sqlbid)
                                .then(function (data) {
                                  result.acceptBid.push(data);
                                })
                                ['catch'](function (err) {
                                  console.log('err');
                                })
                            );

                          case 21:
                            _iteratorNormalCompletion = true;
                            _context10.next = 15;
                            break;

                          case 24:
                            _context10.next = 30;
                            break;

                          case 26:
                            _context10.prev = 26;
                            _context10.t0 = _context10['catch'](13);
                            _didIteratorError = true;
                            _iteratorError = _context10.t0;

                          case 30:
                            _context10.prev = 30;
                            _context10.prev = 31;

                            if (!_iteratorNormalCompletion && _iterator['return'] != null) {
                              _iterator['return']();
                            }

                          case 33:
                            _context10.prev = 33;

                            if (!_didIteratorError) {
                              _context10.next = 36;
                              break;
                            }

                            throw _iteratorError;

                          case 36:
                            return _context10.finish(33);

                          case 37:
                            return _context10.finish(30);

                          case 38:
                            if (!(groupbyAsk[0].length > 0)) {
                              _context10.next = 67;
                              break;
                            }

                            _iteratorNormalCompletion2 = true;
                            _didIteratorError2 = false;
                            _iteratorError2 = undefined;
                            _context10.prev = 42;
                            _iterator2 = groupbyAsk[0][Symbol.iterator]();

                          case 44:
                            if ((_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done)) {
                              _context10.next = 53;
                              break;
                            }

                            _eachobj = _step2.value;
                            _create = ''.concat(moment(_eachobj.created_at).format('YYYY-MM-DD'));
                            sqlask = 'select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",\n          s.company_logo as companylogo,b.company_logo as b_companylogo,\n          s.user_name as sellerusername,b.user_name as bidderusername,\n          s.first_name as sellerFirst,p."productName" as product_name,\n                s.last_name as sellerLast,b.first_name as bidderFirst,b.last_name as bidderLast,O.id as order_id,O."status",O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c\n                LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n                LEFT OUTER JOIN images i on i."productId" = c."product_id"\n                LEFT OUTER JOIN users s on s.id = c."seller_id"\n                LEFT OUTER JOIN users b on b.id = c."bidder_id"\n                LEFT OUTER JOIN products p on p.id = c."product_id"\n                LEFT OUTER JOIN orders O on c.id = O."counter_id"\n                where c."created_at"=\''
                              .concat(_create, '\' and c."bidder_id"=')
                              .concat(_eachobj.bidder_id, ' and c."expiry_day"=')
                              .concat(_eachobj.expiry_day, '\n                 and c."product_id"=')
                              .concat(_eachobj.product_id, ' and c.seller_id=')
                              .concat(
                                req.body.loggedUser,
                                " and c.type_of_offer='Accept' and c.is_deleted='false'\n                and c.type_of='ask' and c.expiry_date > now() AT TIME ZONE 'UTC'\n                and c.\"bid_and_ask_id\"="
                              )
                              .concat(_eachobj.bid_and_ask_id, '; ');
                            _context10.next = 50;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex
                                .raw(sqlask)
                                .then(function (data) {
                                  result.acceptAsk.push(data);
                                })
                                ['catch'](function (err) {
                                  console.log('err');
                                })
                            );

                          case 50:
                            _iteratorNormalCompletion2 = true;
                            _context10.next = 44;
                            break;

                          case 53:
                            _context10.next = 59;
                            break;

                          case 55:
                            _context10.prev = 55;
                            _context10.t1 = _context10['catch'](42);
                            _didIteratorError2 = true;
                            _iteratorError2 = _context10.t1;

                          case 59:
                            _context10.prev = 59;
                            _context10.prev = 60;

                            if (!_iteratorNormalCompletion2 && _iterator2['return'] != null) {
                              _iterator2['return']();
                            }

                          case 62:
                            _context10.prev = 62;

                            if (!_didIteratorError2) {
                              _context10.next = 65;
                              break;
                            }

                            throw _iteratorError2;

                          case 65:
                            return _context10.finish(62);

                          case 66:
                            return _context10.finish(59);

                          case 67:
                            ask = result.acceptAsk;
                            bid = result.acceptBid;
                            temp = [];
                            temp1 = [];

                            for (i = 0; i < ask.length; i++) {
                              for (j = 0; j < ask[i].rows.length; j++) {
                                temp.push(ask[i].rows[j]);
                              }
                            }

                            for (i = 0; i < bid.length; i++) {
                              for (j = 0; j < bid[i].rows.length; j++) {
                                temp1.push(bid[i].rows[j]);
                              }
                            }

                            result.acceptAsk = temp;
                            result.acceptBid = temp1;
                            return _context10.abrupt('return', {
                              v: res.json(Response(constant.statusCode.ok, 'Active Offer fetched', result)),
                            });

                          case 76:
                          case 'end':
                            return _context10.stop();
                        }
                      }
                    },
                    null,
                    null,
                    [
                      [13, 26, 30, 38],
                      [31, , 33, 37],
                      [42, 55, 59, 67],
                      [60, , 62, 66],
                    ]
                  );
                })()
              );

            case 3:
              _ret = _context11.sent;

              if (!(_typeof(_ret) === 'object')) {
                _context11.next = 6;
                break;
              }

              return _context11.abrupt('return', _ret.v);

            case 6:
              _context11.next = 11;
              break;

            case 8:
              _context11.prev = 8;
              _context11.t0 = _context11['catch'](0);
              console.log('err in getAcceptOfferByUserId');

            case 11:
            case 'end':
              return _context11.stop();
          }
        }
      },
      null,
      null,
      [[0, 8]]
    );
  }

  getAcceptOfferByUserId().then(function (response) {});
}

function getSentAcceptOfferByUserId(req, res) {
  function getAcceptOfferByUserId() {
    var ask, bid, temp, temp1, i, j, _ret2;

    return regeneratorRuntime.async(
      function getAcceptOfferByUserId$(_context13) {
        while (1) {
          switch ((_context13.prev = _context13.next)) {
            case 0:
              _context13.prev = 0;
              _context13.next = 3;
              return regeneratorRuntime.awrap(
                (function _callee5() {
                  var result,
                    groupbyAsk,
                    groupbyBid,
                    groupbyAsksql,
                    groupbyBidsql,
                    _iteratorNormalCompletion3,
                    _didIteratorError3,
                    _iteratorError3,
                    _iterator3,
                    _step3,
                    eachobj,
                    create,
                    _iteratorNormalCompletion4,
                    _didIteratorError4,
                    _iteratorError4,
                    _iterator4,
                    _step4,
                    _eachobj2,
                    _create2;

                  return regeneratorRuntime.async(
                    function _callee5$(_context12) {
                      while (1) {
                        switch ((_context12.prev = _context12.next)) {
                          case 0:
                            result = {
                              acceptAsk: [],
                              acceptBid: [],
                            };
                            groupbyAsk = [];
                            groupbyBid = [];
                            groupbyAsksql = 'select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id\n  from counters where bidder_id='.concat(
                              req.body.loggedUser,
                              " and type_of_offer='Accept' and is_deleted='false'\n  and type_of='ask' and expiry_date > now() AT TIME ZONE 'UTC'\n  group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id ;"
                            );
                            _context12.next = 6;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex.raw(groupbyAsksql).then(function (data) {
                                groupbyAsk.push(data.rows);
                              })
                            );

                          case 6:
                            groupbyBidsql = 'select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id\n  from counters where seller_id='.concat(
                              req.body.loggedUser,
                              " and type_of_offer='Accept' and is_deleted='false'\n  and type_of='bid' and expiry_date > now() AT TIME ZONE 'UTC'\n  group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id ;"
                            );
                            _context12.next = 9;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex.raw(groupbyBidsql).then(function (data) {
                                groupbyBid.push(data.rows);
                              })
                            );

                          case 9:
                            if (!(groupbyBid[0].length > 0)) {
                              _context12.next = 38;
                              break;
                            }

                            _iteratorNormalCompletion3 = true;
                            _didIteratorError3 = false;
                            _iteratorError3 = undefined;
                            _context12.prev = 13;
                            _iterator3 = groupbyBid[0][Symbol.iterator]();

                          case 15:
                            if ((_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done)) {
                              _context12.next = 24;
                              break;
                            }

                            eachobj = _step3.value;
                            create = ''.concat(moment(eachobj.created_at).format('YYYY-MM-DD'));
                            sqlbid = 'select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,\n          a."producttype",s.user_name as sellerusername,s.first_name as sellerFirst,p."productName" as product_name,\n  s.last_name as sellerLast,s.company_logo as companylogo,\n  b.user_name as bidderusername,b.first_name as bidderFirst,b.last_name as bidderLast,\n  b.company_logo as b_companylogo, O.id as order_id,O."status", O."delivered", O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c\n  LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n  LEFT OUTER JOIN images i on i."productId" = c."product_id"\n  LEFT OUTER JOIN users s on s.id = c."seller_id"\n  LEFT OUTER JOIN users b on b.id = c."bidder_id"\n  LEFT OUTER JOIN products p on p.id = c."product_id"\n  LEFT OUTER JOIN orders O on c.id = O."counter_id"\n  where c."created_at"=\''
                              .concat(create, '\' and c."seller_id"=')
                              .concat(req.body.loggedUser, ' and c."expiry_day"=')
                              .concat(eachobj.expiry_day, '\n  and c."product_id"=')
                              .concat(eachobj.product_id, " and type_of='bid' and c.bidder_id=")
                              .concat(
                                eachobj.bidder_id,
                                "\n  and c.type_of_offer='Accept' and c.is_deleted='false' and (c.status!='decline' or c.status is null)\n  and c.type_of='bid' and c.expiry_date > now() AT TIME ZONE 'UTC'\n  and c.\"bid_and_ask_id\"="
                              )
                              .concat(eachobj.bid_and_ask_id, '; ');
                            _context12.next = 21;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex
                                .raw(sqlbid)
                                .then(function (data) {
                                  result.acceptBid.push(data);
                                })
                                ['catch'](function (err) {
                                  console.log('err');
                                })
                            );

                          case 21:
                            _iteratorNormalCompletion3 = true;
                            _context12.next = 15;
                            break;

                          case 24:
                            _context12.next = 30;
                            break;

                          case 26:
                            _context12.prev = 26;
                            _context12.t0 = _context12['catch'](13);
                            _didIteratorError3 = true;
                            _iteratorError3 = _context12.t0;

                          case 30:
                            _context12.prev = 30;
                            _context12.prev = 31;

                            if (!_iteratorNormalCompletion3 && _iterator3['return'] != null) {
                              _iterator3['return']();
                            }

                          case 33:
                            _context12.prev = 33;

                            if (!_didIteratorError3) {
                              _context12.next = 36;
                              break;
                            }

                            throw _iteratorError3;

                          case 36:
                            return _context12.finish(33);

                          case 37:
                            return _context12.finish(30);

                          case 38:
                            if (!(groupbyAsk[0].length > 0)) {
                              _context12.next = 67;
                              break;
                            }

                            _iteratorNormalCompletion4 = true;
                            _didIteratorError4 = false;
                            _iteratorError4 = undefined;
                            _context12.prev = 42;
                            _iterator4 = groupbyAsk[0][Symbol.iterator]();

                          case 44:
                            if ((_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done)) {
                              _context12.next = 53;
                              break;
                            }

                            _eachobj2 = _step4.value;
                            _create2 = ''.concat(moment(_eachobj2.created_at).format('YYYY-MM-DD'));
                            sqlask = 'select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",s.user_name as sellerusername,\n          s.first_name as sellerFirst,p."productName" as product_name,\n  s.last_name as sellerLast,b.user_name as bidderusername,s.company_logo as companylogo,\n  b.first_name as bidderFirst,b.last_name as bidderLast, b.company_logo as b_companylogo,\n  O.id as order_id,O."status",O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c\n  LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n  LEFT OUTER JOIN images i on i."productId" = c."product_id"\n  LEFT OUTER JOIN users s on s.id = c."seller_id"\n  LEFT OUTER JOIN users b on b.id = c."bidder_id"\n  LEFT OUTER JOIN products p on p.id = c."product_id"\n  LEFT OUTER JOIN orders O on c.id = O."counter_id"\n  where c."created_at"=\''
                              .concat(_create2, '\' and c."bidder_id"=')
                              .concat(req.body.loggedUser, ' and c."expiry_day"=')
                              .concat(_eachobj2.expiry_day, '\n  and c."product_id"=')
                              .concat(_eachobj2.product_id, ' and c.seller_id=')
                              .concat(
                                _eachobj2.seller_id,
                                " and c.type_of_offer='Accept' and c.is_deleted='false'\n  and c.type_of='ask' and c.expiry_date > now() AT TIME ZONE 'UTC'\n  and c.\"bid_and_ask_id\"="
                              )
                              .concat(_eachobj2.bid_and_ask_id, '; ');
                            _context12.next = 50;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex
                                .raw(sqlask)
                                .then(function (data) {
                                  result.acceptAsk.push(data);
                                })
                                ['catch'](function (err) {
                                  console.log('err');
                                })
                            );

                          case 50:
                            _iteratorNormalCompletion4 = true;
                            _context12.next = 44;
                            break;

                          case 53:
                            _context12.next = 59;
                            break;

                          case 55:
                            _context12.prev = 55;
                            _context12.t1 = _context12['catch'](42);
                            _didIteratorError4 = true;
                            _iteratorError4 = _context12.t1;

                          case 59:
                            _context12.prev = 59;
                            _context12.prev = 60;

                            if (!_iteratorNormalCompletion4 && _iterator4['return'] != null) {
                              _iterator4['return']();
                            }

                          case 62:
                            _context12.prev = 62;

                            if (!_didIteratorError4) {
                              _context12.next = 65;
                              break;
                            }

                            throw _iteratorError4;

                          case 65:
                            return _context12.finish(62);

                          case 66:
                            return _context12.finish(59);

                          case 67:
                            ask = result.acceptAsk;
                            bid = result.acceptBid;
                            temp = [];
                            temp1 = [];

                            for (i = 0; i < ask.length; i++) {
                              for (j = 0; j < ask[i].rows.length; j++) {
                                temp.push(ask[i].rows[j]);
                              }
                            }

                            for (i = 0; i < bid.length; i++) {
                              for (j = 0; j < bid[i].rows.length; j++) {
                                temp1.push(bid[i].rows[j]);
                              }
                            }

                            result.acceptAsk = temp;
                            result.acceptBid = temp1;
                            return _context12.abrupt('return', {
                              v: res.json(Response(constant.statusCode.ok, 'Active Offer fetched', result)),
                            });

                          case 76:
                          case 'end':
                            return _context12.stop();
                        }
                      }
                    },
                    null,
                    null,
                    [
                      [13, 26, 30, 38],
                      [31, , 33, 37],
                      [42, 55, 59, 67],
                      [60, , 62, 66],
                    ]
                  );
                })()
              );

            case 3:
              _ret2 = _context13.sent;

              if (!(_typeof(_ret2) === 'object')) {
                _context13.next = 6;
                break;
              }

              return _context13.abrupt('return', _ret2.v);

            case 6:
              _context13.next = 11;
              break;

            case 8:
              _context13.prev = 8;
              _context13.t0 = _context13['catch'](0);
              console.log('err in getAcceptOfferByUserId');

            case 11:
            case 'end':
              return _context13.stop();
          }
        }
      },
      null,
      null,
      [[0, 8]]
    );
  }

  getAcceptOfferByUserId().then(function (response) {});
} // function to get pending offers by saurabh 7-5-2020
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
  function getPendingOfferByUserId() {
    var searchTexr, searchArray, sell, buy, temp, temp1, i, j, _ret3, _ret4;

    return regeneratorRuntime.async(
      function getPendingOfferByUserId$(_context16) {
        while (1) {
          switch ((_context16.prev = _context16.next)) {
            case 0:
              _context16.prev = 0;
              searchTexr = String(req.body.searchName);
              searchArray = searchTexr.split(' ');
              console.log('searchArray', searchArray);

              if (!req.body.searchName) {
                _context16.next = 12;
                break;
              }

              _context16.next = 7;
              return regeneratorRuntime.awrap(
                (function _callee6() {
                  var result,
                    groupbySelling,
                    groupbyBuying,
                    groupbySellingsql,
                    groupbyBuyingsql,
                    _iteratorNormalCompletion5,
                    _didIteratorError5,
                    _iteratorError5,
                    _iterator5,
                    _step5,
                    eachobj,
                    searchChar,
                    orderQuery,
                    create,
                    _iteratorNormalCompletion6,
                    _didIteratorError6,
                    _iteratorError6,
                    _iterator6,
                    _step6,
                    _eachobj3,
                    _searchChar,
                    _orderQuery,
                    _create3;

                  return regeneratorRuntime.async(
                    function _callee6$(_context14) {
                      while (1) {
                        switch ((_context14.prev = _context14.next)) {
                          case 0:
                            console.log('searchArray***************************');
                            result = {
                              selling: [],
                              buying: [],
                            };
                            groupbySelling = [];
                            groupbyBuying = []; // and type_of_offer='Accept'
                            // and type_of='bid'
                            //and type_of_offer='Accept'
                            //and type_of='bid'

                            console.log('userid is', req.body.loggedUser); // const sData = await common_query.findAllData(CounterModel, { "id": 6318 })
                            // console.log('sDatatatatataat', sData.data.toJSON())

                            groupbySellingsql = 'select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status\n    from counters where seller_id='.concat(
                              req.body.loggedUser,
                              " \n    and is_deleted='false'  group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status ;"
                            );
                            _context14.next = 8;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex.raw(groupbySellingsql).then(function (data) {
                                // console.log('selling query res----------------------', data.rows)
                                groupbySelling.push(data.rows);
                              })
                            );

                          case 8:
                            groupbyBuyingsql = 'select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status\n    from counters where bidder_id='.concat(
                              req.body.loggedUser,
                              "  and is_deleted='false'\n    group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status ;"
                            );
                            _context14.next = 11;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex.raw(groupbyBuyingsql).then(function (data) {
                                // console.log('buying query res-------------------', data.rows)
                                groupbyBuying.push(data.rows);
                              })
                            );

                          case 11:
                            if (!(groupbyBuying[0].length > 0)) {
                              _context14.next = 42;
                              break;
                            }

                            _iteratorNormalCompletion5 = true;
                            _didIteratorError5 = false;
                            _iteratorError5 = undefined;
                            _context14.prev = 15;
                            _iterator5 = groupbyBuying[0][Symbol.iterator]();

                          case 17:
                            if ((_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done)) {
                              _context14.next = 28;
                              break;
                            }

                            eachobj = _step5.value;
                            (searchChar = void 0), (orderQuery = void 0);

                            if (searchArray.length == 1) {
                              searchChar = '(s."user_name"\n        ilike \'%'.concat(req.body.searchName, "%')  AND s.is_active=true ");
                            } else if (searchArray.length > 1) {
                              searchChar = '(s."user_name"\n        ilike \'%'.concat(searchArray[0], "%')  AND s.is_active=true ");
                            }

                            create = ''.concat(moment(eachobj.created_at).format('YYYY-MM-DD'));
                            sqlbid = 'select c.*,i."imageUrl",sum(c."total_amount")\n    OVER() AS full_amount,a.type,a."producttype",s.user_name as sellerUserName,\n    s.company_logo as companylogo,s.first_name as sellerFirst,p."productName" as product_name,\n    s.last_name as sellerLast,b.user_name as bidderUserName,b.first_name as bidderFirst,\n    b.company_logo as b_companylogo,b.last_name as bidderLast,\n    O.id as order_id,O."status", O."delivered", O."createdbyId",\n    O."track_no",O."courier",O."paymentdetail",f."feedback_by_seller" as seller_feedback,\n    f."feedback_by_bidder" as bidder_feedback from counters c\n    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n    LEFT OUTER JOIN images i on i."productId" = c."product_id"\n    LEFT OUTER JOIN users s on s.id = c."seller_id"\n    LEFT OUTER JOIN users b on b.id = c."bidder_id"\n    LEFT OUTER JOIN products p on p.id = c."product_id"\n    LEFT OUTER JOIN orders O on c.id = O."counter_id"\n    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"\n    where c."created_at"=\''
                              .concat(create, '\' and c."seller_id"=')
                              .concat(eachobj.seller_id, '\n    and c."expiry_day"=')
                              .concat(eachobj.expiry_day, '\n    and  ')
                              .concat(searchChar ? searchChar : '', '\n    and c."product_id"=')
                              .concat(eachobj.product_id, ' and c.bidder_id=')
                              .concat(eachobj.bidder_id, '\n    and c.is_deleted=\'false\'\n\n    and c."bid_and_ask_id"=')
                              .concat(eachobj.bid_and_ask_id, '; ');
                            _context14.next = 25;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex
                                .raw(sqlbid)
                                .then(function (data) {
                                  // console.log('data in buy query----->', data.rows)
                                  result.buying.push(data);
                                })
                                ['catch'](function (err) {
                                  console.log('err in buy query', err);
                                })
                            );

                          case 25:
                            _iteratorNormalCompletion5 = true;
                            _context14.next = 17;
                            break;

                          case 28:
                            _context14.next = 34;
                            break;

                          case 30:
                            _context14.prev = 30;
                            _context14.t0 = _context14['catch'](15);
                            _didIteratorError5 = true;
                            _iteratorError5 = _context14.t0;

                          case 34:
                            _context14.prev = 34;
                            _context14.prev = 35;

                            if (!_iteratorNormalCompletion5 && _iterator5['return'] != null) {
                              _iterator5['return']();
                            }

                          case 37:
                            _context14.prev = 37;

                            if (!_didIteratorError5) {
                              _context14.next = 40;
                              break;
                            }

                            throw _iteratorError5;

                          case 40:
                            return _context14.finish(37);

                          case 41:
                            return _context14.finish(34);

                          case 42:
                            if (!(groupbySelling[0].length > 0)) {
                              _context14.next = 73;
                              break;
                            }

                            _iteratorNormalCompletion6 = true;
                            _didIteratorError6 = false;
                            _iteratorError6 = undefined;
                            _context14.prev = 46;
                            _iterator6 = groupbySelling[0][Symbol.iterator]();

                          case 48:
                            if ((_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done)) {
                              _context14.next = 59;
                              break;
                            }

                            _eachobj3 = _step6.value;
                            (_searchChar = void 0), (_orderQuery = void 0);

                            if (searchArray.length == 1) {
                              _searchChar = '(b."user_name"\n            ilike \'%'.concat(req.body.searchName, "%') AND b.is_active=true ");
                            } else if (searchArray.length > 1) {
                              _searchChar = '(b."user_name"\n            ilike \'%'.concat(searchArray[0], "%') AND b.is_active=true ");
                            }

                            _create3 = ''.concat(moment(_eachobj3.created_at).format('YYYY-MM-DD'));
                            sqlask = 'select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",\n    s.user_name as sellerUserName,s.first_name as sellerFirst,p."productName" as product_name,\n    s.last_name as sellerLast,b.user_name as bidderUserName,\n    s.company_logo as companylogo,b.company_logo as b_companylogo,\n    b.first_name as bidderFirst,b.last_name as bidderLast, O.id as order_id,O."status",\n    O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail",\n    f."feedback_by_seller" as seller_feedback,f."feedback_by_bidder" as bidder_feedback from counters c\n    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n    LEFT OUTER JOIN images i on i."productId" = c."product_id"\n    LEFT OUTER JOIN users s on s.id = c."seller_id"\n    LEFT OUTER JOIN users b on b.id = c."bidder_id"\n    LEFT OUTER JOIN products p on p.id = c."product_id"\n    LEFT OUTER JOIN orders O on c.id = O."counter_id"\n    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"\n    where c."created_at"=\''
                              .concat(_create3, '\' and\n    c."bidder_id"=')
                              .concat(_eachobj3.bidder_id, ' and c."expiry_day"=')
                              .concat(_eachobj3.expiry_day, '\n    and c."product_id"=')
                              .concat(_eachobj3.product_id, '\n    and c.seller_id=')
                              .concat(_eachobj3.seller_id, " and c.is_deleted='false'\n    and  ")
                              .concat(_searchChar ? _searchChar : '', '\n    and c."bid_and_ask_id"=')
                              .concat(_eachobj3.bid_and_ask_id, '; ');
                            _context14.next = 56;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex
                                .raw(sqlask)
                                .then(function (data) {
                                  // console.log('data in sell query----->', data.rows)
                                  result.selling.push(data);
                                })
                                ['catch'](function (err) {
                                  console.log('err in sell query', err);
                                })
                            );

                          case 56:
                            _iteratorNormalCompletion6 = true;
                            _context14.next = 48;
                            break;

                          case 59:
                            _context14.next = 65;
                            break;

                          case 61:
                            _context14.prev = 61;
                            _context14.t1 = _context14['catch'](46);
                            _didIteratorError6 = true;
                            _iteratorError6 = _context14.t1;

                          case 65:
                            _context14.prev = 65;
                            _context14.prev = 66;

                            if (!_iteratorNormalCompletion6 && _iterator6['return'] != null) {
                              _iterator6['return']();
                            }

                          case 68:
                            _context14.prev = 68;

                            if (!_didIteratorError6) {
                              _context14.next = 71;
                              break;
                            }

                            throw _iteratorError6;

                          case 71:
                            return _context14.finish(68);

                          case 72:
                            return _context14.finish(65);

                          case 73:
                            sell = result.selling;
                            buy = result.buying;
                            temp = [];
                            temp1 = [];

                            for (i = 0; i < sell.length; i++) {
                              for (j = 0; j < sell[i].rows.length; j++) {
                                temp.push(sell[i].rows[j]);
                              }
                            }

                            for (i = 0; i < buy.length; i++) {
                              for (j = 0; j < buy[i].rows.length; j++) {
                                temp1.push(buy[i].rows[j]);
                              }
                            }

                            result.selling = temp;
                            result.buying = temp1;
                            return _context14.abrupt('return', {
                              v: res.json(Response(constant.statusCode.ok, 'Pending offers fetched', result)),
                            });

                          case 82:
                          case 'end':
                            return _context14.stop();
                        }
                      }
                    },
                    null,
                    null,
                    [
                      [15, 30, 34, 42],
                      [35, , 37, 41],
                      [46, 61, 65, 73],
                      [66, , 68, 72],
                    ]
                  );
                })()
              );

            case 7:
              _ret3 = _context16.sent;

              if (!(_typeof(_ret3) === 'object')) {
                _context16.next = 10;
                break;
              }

              return _context16.abrupt('return', _ret3.v);

            case 10:
              _context16.next = 17;
              break;

            case 12:
              _context16.next = 14;
              return regeneratorRuntime.awrap(
                (function _callee7() {
                  var result,
                    groupbySelling,
                    groupbyBuying,
                    groupbySellingsql,
                    groupbyBuyingsql,
                    _iteratorNormalCompletion7,
                    _didIteratorError7,
                    _iteratorError7,
                    _iterator7,
                    _step7,
                    eachobj,
                    create,
                    _iteratorNormalCompletion8,
                    _didIteratorError8,
                    _iteratorError8,
                    _iterator8,
                    _step8,
                    _eachobj4,
                    _create4;

                  return regeneratorRuntime.async(
                    function _callee7$(_context15) {
                      while (1) {
                        switch ((_context15.prev = _context15.next)) {
                          case 0:
                            console.log('searchArray no search ***************************');
                            result = {
                              selling: [],
                              buying: [],
                            };
                            groupbySelling = [];
                            groupbyBuying = []; // and type_of_offer='Accept'
                            // and type_of='bid'
                            //and type_of_offer='Accept'
                            //and type_of='bid'

                            console.log('userid is', req.body.loggedUser); // const sData = await common_query.findAllData(CounterModel, { "id": 6318 })
                            // console.log('sDatatatatataat', sData.data.toJSON())

                            groupbySellingsql = 'select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status\n    from counters where seller_id='.concat(
                              req.body.loggedUser,
                              " and (status='accept' or status='decline')\n    and is_deleted='false'  group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status ;"
                            );
                            _context15.next = 8;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex.raw(groupbySellingsql).then(function (data) {
                                // console.log('selling query res----------------------', data.rows)
                                groupbySelling.push(data.rows);
                              })
                            );

                          case 8:
                            groupbyBuyingsql = 'select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status\n    from counters where bidder_id='.concat(
                              req.body.loggedUser,
                              " and (status='accept' or status='decline') and is_deleted='false'\n    group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id,status ;"
                            );
                            _context15.next = 11;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex.raw(groupbyBuyingsql).then(function (data) {
                                // console.log('buying query res-------------------', data.rows)
                                groupbyBuying.push(data.rows);
                              })
                            );

                          case 11:
                            if (!(groupbyBuying[0].length > 0)) {
                              _context15.next = 40;
                              break;
                            }

                            _iteratorNormalCompletion7 = true;
                            _didIteratorError7 = false;
                            _iteratorError7 = undefined;
                            _context15.prev = 15;
                            _iterator7 = groupbyBuying[0][Symbol.iterator]();

                          case 17:
                            if ((_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done)) {
                              _context15.next = 26;
                              break;
                            }

                            eachobj = _step7.value;
                            create = ''.concat(moment(eachobj.created_at).format('YYYY-MM-DD'));
                            sqlbid = 'select c.*,i."imageUrl",sum(c."total_amount")\n    OVER() AS full_amount,a.type,a."producttype",s.user_name as sellerUserName,\n    s.company_logo as companylogo,s.first_name as sellerFirst,p."productName" as product_name,\n    s.last_name as sellerLast,b.user_name as bidderUserName,b.first_name as bidderFirst,\n    b.company_logo as b_companylogo,b.last_name as bidderLast,\n    O.id as order_id,O."status", O."delivered", O."createdbyId",\n    O."track_no",O."courier",O."paymentdetail",f."feedback_by_seller" as seller_feedback,\n    f."feedback_by_bidder" as bidder_feedback from counters c\n    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n    LEFT OUTER JOIN images i on i."productId" = c."product_id"\n    LEFT OUTER JOIN users s on s.id = c."seller_id"\n    LEFT OUTER JOIN users b on b.id = c."bidder_id"\n    LEFT OUTER JOIN products p on p.id = c."product_id"\n    LEFT OUTER JOIN orders O on c.id = O."counter_id"\n    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"\n    where c."created_at"=\''
                              .concat(create, '\' and c."seller_id"=')
                              .concat(eachobj.seller_id, '\n    and c."expiry_day"=')
                              .concat(eachobj.expiry_day, '\n\n    and c."product_id"=')
                              .concat(eachobj.product_id, ' and c.bidder_id=')
                              .concat(eachobj.bidder_id, '\n    and c.is_deleted=\'false\'\n\n    and c."bid_and_ask_id"=')
                              .concat(eachobj.bid_and_ask_id, '; ');
                            _context15.next = 23;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex
                                .raw(sqlbid)
                                .then(function (data) {
                                  // console.log('data in buy query----->', data.rows)
                                  result.buying.push(data);
                                })
                                ['catch'](function (err) {
                                  console.log('err in buy query', err);
                                })
                            );

                          case 23:
                            _iteratorNormalCompletion7 = true;
                            _context15.next = 17;
                            break;

                          case 26:
                            _context15.next = 32;
                            break;

                          case 28:
                            _context15.prev = 28;
                            _context15.t0 = _context15['catch'](15);
                            _didIteratorError7 = true;
                            _iteratorError7 = _context15.t0;

                          case 32:
                            _context15.prev = 32;
                            _context15.prev = 33;

                            if (!_iteratorNormalCompletion7 && _iterator7['return'] != null) {
                              _iterator7['return']();
                            }

                          case 35:
                            _context15.prev = 35;

                            if (!_didIteratorError7) {
                              _context15.next = 38;
                              break;
                            }

                            throw _iteratorError7;

                          case 38:
                            return _context15.finish(35);

                          case 39:
                            return _context15.finish(32);

                          case 40:
                            if (!(groupbySelling[0].length > 0)) {
                              _context15.next = 69;
                              break;
                            }

                            _iteratorNormalCompletion8 = true;
                            _didIteratorError8 = false;
                            _iteratorError8 = undefined;
                            _context15.prev = 44;
                            _iterator8 = groupbySelling[0][Symbol.iterator]();

                          case 46:
                            if ((_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done)) {
                              _context15.next = 55;
                              break;
                            }

                            _eachobj4 = _step8.value;
                            _create4 = ''.concat(moment(_eachobj4.created_at).format('YYYY-MM-DD'));
                            sqlask = 'select c.*,i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype",\n    s.user_name as sellerUserName,s.first_name as sellerFirst,p."productName" as product_name,\n    s.last_name as sellerLast,b.user_name as bidderUserName,\n    s.company_logo as companylogo,b.company_logo as b_companylogo,\n    b.first_name as bidderFirst,b.last_name as bidderLast, O.id as order_id,O."status",\n    O."delivered",O."createdbyId",O."track_no",O."courier",O."paymentdetail",\n    f."feedback_by_seller" as seller_feedback,f."feedback_by_bidder" as bidder_feedback from counters c\n    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n    LEFT OUTER JOIN images i on i."productId" = c."product_id"\n    LEFT OUTER JOIN users s on s.id = c."seller_id"\n    LEFT OUTER JOIN users b on b.id = c."bidder_id"\n    LEFT OUTER JOIN products p on p.id = c."product_id"\n    LEFT OUTER JOIN orders O on c.id = O."counter_id"\n    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"\n    where c."created_at"=\''
                              .concat(_create4, '\' and\n    c."bidder_id"=')
                              .concat(_eachobj4.bidder_id, ' and c."expiry_day"=')
                              .concat(_eachobj4.expiry_day, '\n    and c."product_id"=')
                              .concat(_eachobj4.product_id, '\n    and c.seller_id=')
                              .concat(_eachobj4.seller_id, ' and c.is_deleted=\'false\'\n    and c."bid_and_ask_id"=')
                              .concat(_eachobj4.bid_and_ask_id, '; ');
                            _context15.next = 52;
                            return regeneratorRuntime.awrap(
                              bookshelf.knex
                                .raw(sqlask)
                                .then(function (data) {
                                  // console.log('data in sell query----->', data.rows)
                                  result.selling.push(data);
                                })
                                ['catch'](function (err) {
                                  console.log('err in sell query', err);
                                })
                            );

                          case 52:
                            _iteratorNormalCompletion8 = true;
                            _context15.next = 46;
                            break;

                          case 55:
                            _context15.next = 61;
                            break;

                          case 57:
                            _context15.prev = 57;
                            _context15.t1 = _context15['catch'](44);
                            _didIteratorError8 = true;
                            _iteratorError8 = _context15.t1;

                          case 61:
                            _context15.prev = 61;
                            _context15.prev = 62;

                            if (!_iteratorNormalCompletion8 && _iterator8['return'] != null) {
                              _iterator8['return']();
                            }

                          case 64:
                            _context15.prev = 64;

                            if (!_didIteratorError8) {
                              _context15.next = 67;
                              break;
                            }

                            throw _iteratorError8;

                          case 67:
                            return _context15.finish(64);

                          case 68:
                            return _context15.finish(61);

                          case 69:
                            sell = result.selling;
                            buy = result.buying;
                            temp = [];
                            temp1 = [];

                            for (i = 0; i < sell.length; i++) {
                              for (j = 0; j < sell[i].rows.length; j++) {
                                temp.push(sell[i].rows[j]);
                              }
                            }

                            for (i = 0; i < buy.length; i++) {
                              for (j = 0; j < buy[i].rows.length; j++) {
                                temp1.push(buy[i].rows[j]);
                              }
                            }

                            result.selling = temp;
                            result.buying = temp1;
                            return _context15.abrupt('return', {
                              v: res.json(Response(constant.statusCode.ok, 'Pending offers fetched', result)),
                            });

                          case 78:
                          case 'end':
                            return _context15.stop();
                        }
                      }
                    },
                    null,
                    null,
                    [
                      [15, 28, 32, 40],
                      [33, , 35, 39],
                      [44, 57, 61, 69],
                      [62, , 64, 68],
                    ]
                  );
                })()
              );

            case 14:
              _ret4 = _context16.sent;

              if (!(_typeof(_ret4) === 'object')) {
                _context16.next = 17;
                break;
              }

              return _context16.abrupt('return', _ret4.v);

            case 17:
              _context16.next = 22;
              break;

            case 19:
              _context16.prev = 19;
              _context16.t0 = _context16['catch'](0);
              console.log('err in Pending Offers', _context16.t0);

            case 22:
            case 'end':
              return _context16.stop();
          }
        }
      },
      null,
      null,
      [[0, 19]]
    );
  }

  getPendingOfferByUserId().then(function (response) {});
}

function getActiveOfferByUserId(req, res) {
  function getActiveOfferByUserId() {
    var _result2;

    return regeneratorRuntime.async(
      function getActiveOfferByUserId$(_context17) {
        while (1) {
          switch ((_context17.prev = _context17.next)) {
            case 0:
              _context17.prev = 0;
              _result2 = {}; // let type_of_offer = ['Counter','Accept'];
              // let type_of = ['ask','bid']
              // for(let i of type_of_offer){
              // for(let j of type_of){

              sqlbid = 'select c.*,i."imageUrl",a.type,a."producttype",s.user_name as sellerUserName,s.first_name as sellerFirst,p."productName" as product_name,\n  s.last_name as sellerLast,s.company_logo as companylogo,b.company_logo as b_companylogo,b.user_name as bidderUserName,b.first_name as bidderFirst,b.last_name as bidderLast from counters c\n  LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n  LEFT OUTER JOIN images i on i."productId" = c."product_id"\n  LEFT OUTER JOIN users s on s.id = c."seller_id"\n  LEFT OUTER JOIN users b on b.id = c."bidder_id"\n  LEFT OUTER JOIN products p on p.id = c."product_id"\n  where (c."bidder_id"='.concat(
                req.body.loggedUser,
                ")\n  and (c.expiry_date > now() AT TIME ZONE 'UTC' and c.is_deleted=false and c.type_of_offer='Counter' and c.type_of='bid' );"
              );
              _context17.next = 5;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sqlbid)
                  .then(function (data) {
                    _result2.counterBid = data;
                  })
                  ['catch'](function (err) {
                    console.log('err');
                  })
              );

            case 5:
              sqlask = 'select c.*,i."imageUrl",a.type,a."producttype",s.user_name as sellerUserName\n  ,s.company_logo as companylogo,s.first_name as sellerFirst,p."productName" as product_name,b.company_logo as b_companylogo\n  ,s.last_name as sellerLast,b.user_name as bidderUserName,b.first_name as bidderFirst,b.last_name as bidderLast from counters c\n  LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n  LEFT OUTER JOIN images i on i."productId" = c."product_id"\n  LEFT OUTER JOIN users s on s.id = c."seller_id"\n  LEFT OUTER JOIN users b on b.id = c."bidder_id"\n  LEFT OUTER JOIN products p on p.id = c."product_id"\n  where (c."seller_id"='.concat(
                req.body.loggedUser,
                ")\n  and (c.expiry_date > now() AT TIME ZONE 'UTC' and c.is_deleted=false and c.type_of_offer='Counter' and c.type_of='ask' );"
              );
              _context17.next = 8;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sqlask)
                  .then(function (data) {
                    _result2.counterAsk = data;
                  })
                  ['catch'](function (err) {
                    console.log('err');
                  })
              );

            case 8:
              return _context17.abrupt('return', res.json(Response(constant.statusCode.ok, 'Active Offer fetched', _result2)));

            case 11:
              _context17.prev = 11;
              _context17.t0 = _context17['catch'](0);
              console.log('err in getActiveOfferByUserId');

            case 14:
            case 'end':
              return _context17.stop();
          }
        }
      },
      null,
      null,
      [[0, 11]]
    );
  }

  getActiveOfferByUserId().then(function (respond) {});
}

function getActiveRecievedByUserId(req, res) {
  function getActiveRecievedByUserId() {
    var _result3;

    return regeneratorRuntime.async(
      function getActiveRecievedByUserId$(_context18) {
        while (1) {
          switch ((_context18.prev = _context18.next)) {
            case 0:
              _context18.prev = 0;
              _result3 = {};
              sqlask = '\n      select c.*,\n\t\t i."imageUrl",\n\t\t a.type,a."producttype",\n\t\t s.user_name as sellerUserName,\n\t\t p."productName" as product_name,\n\t\t b.user_name as bidderUserName,\n\t\t O.id as order_id,O."status" as "order_status", O."delivered", O."createdbyId", O."track_no",O."courier",O."paymentdetail",\n\t\t f."feedback_by_seller" as seller_feedback, f."feedback_by_bidder" as bidder_feedback\n\tfrom counters c\n    LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n    LEFT OUTER JOIN images i on i."productId" = c."product_id"\n    LEFT OUTER JOIN users s on s.id = c."seller_id"\n    LEFT OUTER JOIN users b on b.id = c."bidder_id"\n    LEFT OUTER JOIN products p on p.id = c."product_id"\n    LEFT OUTER JOIN orders O on c.id = O."counter_id"\n    LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"\n    where (c."bidder_id"='
                .concat(req.body.loggedUser, '  or c."seller_id"=')
                .concat(
                  req.body.loggedUser,
                  " )\n    and c.is_deleted='false'\n    and ( type_of='bid' or type_of='ask')\n    and (c.\"status\" is not NULL or  c.expiry_date > now() AT TIME ZONE 'UTC') "
                );
              _context18.next = 5;
              return regeneratorRuntime.awrap(
                bookshelf.knex
                  .raw(sqlask)
                  .then(function (data) {
                    _result3 = data.rows;
                  })
                  ['catch'](function (err) {
                    console.log('err');
                  })
              );

            case 5:
              return _context18.abrupt('return', res.json(Response(constant.statusCode.ok, 'Active Recieved Offer fetched', _result3)));

            case 8:
              _context18.prev = 8;
              _context18.t0 = _context18['catch'](0);
              console.log('err in getActiveOfferByUserId');

            case 11:
            case 'end':
              return _context18.stop();
          }
        }
      },
      null,
      null,
      [[0, 8]]
    );
  }

  getActiveRecievedByUserId().then(function (respond) {});
}

function editUser(req, res) {
  function editUserMethod() {
    var isDuplictate,
      sameId,
      condition,
      checkDuplicate,
      data,
      updatedata,
      _condition,
      _updateUserData4,
      finaldata,
      timeStamp,
      db_path,
      extension,
      imgOriginalName,
      extensionArray,
      format,
      _result4,
      updata,
      cond,
      cimgOriginalName,
      cextensionArray,
      cformat,
      cresult,
      cupdata,
      clogo_cond,
      updateCImage;

    return regeneratorRuntime.async(function editUserMethod$(_context19) {
      while (1) {
        switch ((_context19.prev = _context19.next)) {
          case 0:
            isDuplictate = false;
            sameId = false;

            if (req.body && req.body.user_name == 'null') {
              req.body.user_name = '';
            }

            if (!(req.body && req.body.user_name)) {
              _context19.next = 13;
              break;
            }

            condition = 'select * from users where "user_name" iLike \''.concat(req.body.user_name, '\' and "is_deleted"=false;');
            _context19.next = 7;
            return regeneratorRuntime.awrap(bookshelf.knex.raw(condition));

          case 7:
            checkDuplicate = _context19.sent;
            data = checkDuplicate['rows'];

            if (data && data.length > 0 && data[0].id == req.body.id) {
              isDuplictate = false;
              sameId = true;
            }

            if (!(checkDuplicate.rowCount > 0 && !sameId)) {
              _context19.next = 13;
              break;
            }

            isDuplictate = true;
            return _context19.abrupt(
              'return',
              res.json(Response(constant.statusCode.alreadyExist, 'Username has already been registered. Try with different Username'))
            );

          case 13:
            if (!(!isDuplictate || !req.body.user_name)) {
              _context19.next = 64;
              break;
            }

            updatedata = {
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
            _condition = {
              id: req.body.id,
            };
            _context19.next = 18;
            return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, updatedata, _condition));

          case 18:
            _updateUserData4 = _context19.sent;
            finaldata = _updateUserData4.success.toJSON();

            if (!(_updateUserData4.code == 200)) {
              _context19.next = 63;
              break;
            }

            timeStamp = JSON.stringify(Date.now());
            db_path = '';

            if (!req.files) {
              _context19.next = 60;
              break;
            }

            if (!req.files.file) {
              _context19.next = 39;
              break;
            }

            extension = req.files.file.name.split('.');
            imgOriginalName = req.files.file.name;
            db_path = timeStamp + '_' + imgOriginalName;
            extensionArray = ['jpg', 'jpeg', 'png', 'jfif'];
            format = extension[extension.length - 1];

            if (!extensionArray.includes(format)) {
              _context19.next = 39;
              break;
            }

            _context19.next = 33;
            return regeneratorRuntime.awrap(s3file_upload.uploadProfileImage(req.files.file.data, db_path));

          case 33:
            _result4 = _context19.sent;
            updata = {
              id: req.body.id,
              profile_image_url: _result4.url,
              profile_image_id: uuidv4(),
            };
            cond = {
              id: req.body.id,
            };
            _context19.next = 38;
            return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, updata, cond));

          case 38:
            finaldata.profile_image_url = _result4.url;

          case 39:
            if (!req.files.clogo_file) {
              _context19.next = 57;
              break;
            }

            cextension = req.files.clogo_file.name.split('.');
            cimgOriginalName = req.files.clogo_file.name;
            cdb_path = timeStamp + '_' + cimgOriginalName;
            cextensionArray = ['jpg', 'jpeg', 'png', 'jfif'];
            cformat = cextension[cextension.length - 1];

            if (!cextensionArray.includes(cformat)) {
              _context19.next = 57;
              break;
            }

            _context19.next = 48;
            return regeneratorRuntime.awrap(s3file_upload.uploadCompanyImage(req.files.clogo_file.data, cdb_path));

          case 48:
            cresult = _context19.sent;
            console.log('cresult--->', cresult);
            cupdata = {
              id: req.body.id,
              company_logo: cresult.url,
            };
            clogo_cond = {
              id: req.body.id,
            };
            _context19.next = 54;
            return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, cupdata, clogo_cond));

          case 54:
            updateCImage = _context19.sent;
            console.log('logo update status', updateCImage);
            finaldata.company_logo = cresult.url; // let updateImage1 = await common_query.updateRecord(UserModel, cupdata, clogo_cond)

          case 57:
            return _context19.abrupt('return', res.json(Response(constant.statusCode.ok, 'User edit successful', finaldata)));

          case 60:
            return _context19.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, finaldata)));

          case 61:
            _context19.next = 64;
            break;

          case 63:
            return _context19.abrupt(
              'return',
              res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
            );

          case 64:
          case 'end':
            return _context19.stop();
        }
      }
    });
  }

  editUserMethod().then(function (data) {});
}

function updateprofile(req, res) {
  function updateUserProfileMethod() {
    var updatedata, condition, updateUserData;
    return regeneratorRuntime.async(function updateUserProfileMethod$(_context20) {
      while (1) {
        switch ((_context20.prev = _context20.next)) {
          case 0:
            updatedata = {
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
            condition = {
              id: req.body.id,
            };
            _context20.next = 4;
            return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, updatedata, condition));

          case 4:
            updateUserData = _context20.sent;

            if (!(updateUserData.code == 200)) {
              _context20.next = 9;
              break;
            }

            return _context20.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData)));

          case 9:
            return _context20.abrupt(
              'return',
              res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
            );

          case 10:
          case 'end':
            return _context20.stop();
        }
      }
    });
  }

  updateUserProfileMethod().then(function (data) {});
}

function deleteUser(req, res) {
  function deleteUserMethod() {
    var updatedata, condition, updateUserData;
    return regeneratorRuntime.async(function deleteUserMethod$(_context21) {
      while (1) {
        switch ((_context21.prev = _context21.next)) {
          case 0:
            updatedata = {
              is_deleted: true,
            };
            condition = {
              id: req.body.id,
            };
            _context21.next = 4;
            return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, updatedata, condition));

          case 4:
            updateUserData = _context21.sent;

            if (!(updateUserData.code == 200)) {
              _context21.next = 9;
              break;
            }

            return _context21.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.userDeleteSuccess, updateUserData)));

          case 9:
            return _context21.abrupt(
              'return',
              res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
            );

          case 10:
          case 'end':
            return _context21.stop();
        }
      }
    });
  }

  deleteUserMethod().then(function (data) {});
}

function deleteOffer(req, res) {
  function deleteOffer() {
    var updatedata, condition, updateUserData, dateObj, month, day, year, data, orderdata, condition_chat, sql;
    return regeneratorRuntime.async(function deleteOffer$(_context23) {
      while (1) {
        switch ((_context23.prev = _context23.next)) {
          case 0:
            console.log('declinee offerrrrrr', req.body);
            updatedata = {
              is_deleted: false,
              status: 'decline',
            };
            condition = {
              id: req.body.id,
            };
            _context23.next = 5;
            return regeneratorRuntime.awrap(common_query.updateRecord(CounterModel, updatedata, condition));

          case 5:
            updateUserData = _context23.sent;
            console.log('updateUserData', updateUserData);
            dateObj = new Date();
            month = dateObj.getUTCMonth() + 1; //months from 1-12

            day = dateObj.getUTCDate();
            year = dateObj.getUTCFullYear();
            newdate = year + '-' + month + '-' + day;
            data = {
              counter_id: req.body.id ? req.body.id : null,
              status: 'decline',
              is_deleted: false,
              product_id: req.body.product_id ? req.body.product_id : null,
              createdbyId: req.body.createdbyId ? req.body.createdbyId : null,
              created_at: newdate,
            };
            orderdata = {};
            _context23.next = 16;
            return regeneratorRuntime.awrap(common_query.saveRecord(OrderModel, data));

          case 16:
            orderdata = _context23.sent;
            condition_chat = {
              o_id: req.body.id.toString(),
              p_id: req.body.product_id.toString(),
            };
            sql = "select * from chats where message->'msg'->>\n    'offer_id'="
              .concat("'" + condition_chat.o_id + "'", "\nand message->'msg'->>'product_id'=")
              .concat("'" + condition_chat.p_id + "'"); // console.log('queryyyyyyyyyyyyyy_______________--', sql)

            bookshelf.knex.raw(sql).then(function _callee8(data) {
              var updatedata1, condition1, u_chat;
              return regeneratorRuntime.async(function _callee8$(_context22) {
                while (1) {
                  switch ((_context22.prev = _context22.next)) {
                    case 0:
                      /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
                      updatedata1 = {
                        isActionPerformedbyRecieved: true,
                        isofferAccepted: false,
                      };

                      if (!data.rows[0]) {
                        _context22.next = 8;
                        break;
                      }

                      condition1 = {
                        id: data.rows[0].id,
                      };
                      console.log('data.rows[0]data.rows[0] ', data.rows[0]);
                      _context22.next = 6;
                      return regeneratorRuntime.awrap(common_query.updateRecord(ChatModel, updatedata1, condition1));

                    case 6:
                      u_chat = _context22.sent;
                      console.log('u_chat accept 43434343444 1111111111', u_chat);

                    case 8:
                    case 'end':
                      return _context22.stop();
                  }
                }
              });
            });

            if (!(updateUserData.code == 200)) {
              _context23.next = 24;
              break;
            }

            return _context23.abrupt('return', res.json(Response(constant.statusCode.ok, 'Offer Declined Successfully', updateUserData)));

          case 24:
            return _context23.abrupt(
              'return',
              res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
            );

          case 25:
          case 'end':
            return _context23.stop();
        }
      }
    });
  }

  deleteOffer().then(function (data) {});
}

function deleteAllOffer(req, res) {
  function deleteAllOffer() {
    var i, updatedata, condition, updateUserData, dateObj, month, day, year, data, _orderdata, condition_chat, sql;

    return regeneratorRuntime.async(
      function deleteAllOffer$(_context25) {
        while (1) {
          switch ((_context25.prev = _context25.next)) {
            case 0:
              _context25.prev = 0;
              console.log('delete offers reqqqqqqq::::::', req.body);

              if (!(req.body.length > 0)) {
                _context25.next = 29;
                break;
              }

              i = 0;

            case 4:
              if (!(i < req.body.length)) {
                _context25.next = 28;
                break;
              }

              if (!req.body[i]) {
                _context25.next = 25;
                break;
              }

              updatedata = {
                // is_deleted: true,
                status: 'decline',
              };
              condition = {
                id: req.body[i].id,
              };
              _context25.next = 10;
              return regeneratorRuntime.awrap(common_query.updateRecord(CounterModel, updatedata, condition));

            case 10:
              updateUserData = _context25.sent;
              console.log('uuuuuuuuuuuuuuuuuuuuuuuuuuuuu################', updateUserData);
              dateObj = new Date();
              month = dateObj.getUTCMonth() + 1; //months from 1-12

              day = dateObj.getUTCDate();
              year = dateObj.getUTCFullYear();
              newdate = year + '-' + month + '-' + day;
              data = {
                counter_id: req.body[i].id ? req.body[i].id : null,
                status: 'decline',
                is_deleted: false,
                product_id: req.body[i].product_id ? req.body[i].product_id : null,
                createdbyId: req.body[i].type_of == 'ask' ? req.body[i].seller_id : req.body[i].bidder_id,
                created_at: newdate,
              };
              _orderdata = {};
              _context25.next = 21;
              return regeneratorRuntime.awrap(common_query.saveRecord(OrderModel, data));

            case 21:
              _orderdata = _context25.sent;
              condition_chat = {
                o_id: req.body[i].id.toString(),
                p_id: req.body[i].product_id.toString(),
              };
              sql = "select * from chats where message->'msg'->>\n            'offer_id'="
                .concat("'" + condition_chat.o_id + "'", "\n      and message->'msg'->>'product_id'=")
                .concat("'" + condition_chat.p_id + "'"); // console.log('queryyyyyyyyyyyyyy_______________--', sql)

              bookshelf.knex.raw(sql).then(function _callee9(data) {
                var updatedataD, conditionD, u_chat;
                return regeneratorRuntime.async(function _callee9$(_context24) {
                  while (1) {
                    switch ((_context24.prev = _context24.next)) {
                      case 0:
                        /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
                        updatedataD = {
                          isActionPerformedbyRecieved: true,
                          isofferAccepted: false,
                        };
                        conditionD = {
                          id: data.rows[0].id,
                        };
                        console.log('data.rows[0]data.rows[0] ', data.rows[0]);
                        _context24.next = 5;
                        return regeneratorRuntime.awrap(common_query.updateRecord(ChatModel, updatedataD, conditionD));

                      case 5:
                        u_chat = _context24.sent;
                        console.log('u_chat accept 43434343444 ', u_chat);

                      case 7:
                      case 'end':
                        return _context24.stop();
                    }
                  }
                });
              });

            case 25:
              i++;
              _context25.next = 4;
              break;

            case 28:
              return _context25.abrupt('return', res.json(Response(constant.statusCode.ok, 'Offer Declined Successfully', updateUserData)));

            case 29:
              _context25.next = 34;
              break;

            case 31:
              _context25.prev = 31;
              _context25.t0 = _context25['catch'](0);
              console.log('err in delete', _context25.t0);

            case 34:
            case 'end':
              return _context25.stop();
          }
        }
      },
      null,
      null,
      [[0, 31]]
    );
  }

  deleteAllOffer().then(function (response) {});
}

function addTrackNo(req, res) {
  function addTrackNoMethod() {
    var updatedata, update, condition, cond, updateUserData, notObj, sql, raw2;
    return regeneratorRuntime.async(function addTrackNoMethod$(_context26) {
      while (1) {
        switch ((_context26.prev = _context26.next)) {
          case 0:
            updatedata = {
              track_no: req.body.track_no,
              courier: req.body.courier,
            };
            update = {
              track_no: req.body.track_no,
            };
            condition = {
              counter_id: req.body.counter_id,
            };
            cond = {
              id: req.body.counter_id,
            };
            _context26.next = 6;
            return regeneratorRuntime.awrap(common_query.updateRecord(CounterModel, update, cond));

          case 6:
            _context26.next = 8;
            return regeneratorRuntime.awrap(common_query.updateRecord(OrderModel, updatedata, condition));

          case 8:
            updateUserData = _context26.sent;
            notObj = {
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

            if (!(updateUserData.code == 200)) {
              _context26.next = 17;
              break;
            }

            sql =
              'select c.*,O."track_no" from counters c\n                    LEFT OUTER JOIN orders O on c.id = O."counter_id"\n                    WHERE (c."id" = ?) and c."is_deleted" = false;';
            raw2 = bookshelf.knex.raw(sql, [req.body.counter_id]);
            raw2.then(function (result) {
              return res.json(Response(constant.statusCode.ok, constant.messages.trackNoAdded, result));
            });
            _context26.next = 18;
            break;

          case 17:
            return _context26.abrupt(
              'return',
              res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result))
            );

          case 18:
          case 'end':
            return _context26.stop();
        }
      }
    });
  }

  addTrackNoMethod().then(function (data) {});
}

function addPaymentDetail(req, res) {
  function addPaymentDetailMethod() {
    var updatedata, condition, updateUserData, notObj, sql, raw2;
    return regeneratorRuntime.async(function addPaymentDetailMethod$(_context27) {
      while (1) {
        switch ((_context27.prev = _context27.next)) {
          case 0:
            updatedata = {
              paymentdetail: req.body.paymentdetail,
            };
            condition = {
              counter_id: req.body.counter_id,
            };
            _context27.next = 4;
            return regeneratorRuntime.awrap(common_query.updateRecord(OrderModel, updatedata, condition));

          case 4:
            updateUserData = _context27.sent;
            notObj = {
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

            if (!(updateUserData.code == 200)) {
              _context27.next = 13;
              break;
            }

            sql =
              'select c.*,O."status",O."createdbyId",O."track_no",O."courier",O."paymentdetail" from counters c\n                    LEFT OUTER JOIN orders O on c.id = O."counter_id"\n                    WHERE (c."id" = ?) and c."is_deleted" = false;';
            raw2 = bookshelf.knex.raw(sql, [req.body.counter_id]);
            raw2.then(function (result) {
              return res.json(Response(constant.statusCode.ok, constant.messages.paymentdetail, result));
            });
            _context27.next = 14;
            break;

          case 13:
            return _context27.abrupt(
              'return',
              res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result))
            );

          case 14:
          case 'end':
            return _context27.stop();
        }
      }
    });
  }

  addPaymentDetailMethod().then(function (data) {});
}

function uplodeProfileImage(req, res) {
  function uplodeProfileImageMethod() {
    var timeStamp, db_path, path, extension;
    return regeneratorRuntime.async(function uplodeProfileImageMethod$(_context29) {
      while (1) {
        switch ((_context29.prev = _context29.next)) {
          case 0:
            timeStamp = JSON.stringify(Date.now());
            userid = 'get_user_id';
            db_path = '';
            path = '';
            mkdirp(config.ARTICLEIMAGE).then(function _callee10(data, err) {
              var imgOriginalName, extensionArray, format, _result5, updateImage;

              return regeneratorRuntime.async(function _callee10$(_context28) {
                while (1) {
                  switch ((_context28.prev = _context28.next)) {
                    case 0:
                      if (!err) {
                        _context28.next = 4;
                        break;
                      }

                      return _context28.abrupt(
                        'return',
                        res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, err))
                      );

                    case 4:
                      if (!req.body) {
                        _context28.next = 22;
                        break;
                      }

                      extension = req.files.file.name.split('.');
                      imgOriginalName = req.files.file.name;
                      path = config.PRODUCTIMAGE + timeStamp + '_' + imgOriginalName;
                      db_path = timeStamp + '_' + imgOriginalName;

                      if (!(path != '')) {
                        _context28.next = 22;
                        break;
                      }

                      extensionArray = ['jpg', 'jpeg', 'png', 'jfif'];
                      format = extension[extension.length - 1];

                      if (!extensionArray.includes(format)) {
                        _context28.next = 21;
                        break;
                      }

                      _context28.next = 15;
                      return regeneratorRuntime.awrap(s3file_upload.uploadProductImage(req.files.file.data, db_path));

                    case 15:
                      _result5 = _context28.sent;
                      _context28.next = 18;
                      return regeneratorRuntime.awrap(
                        common_query.updateRecord(
                          imageModel,
                          {
                            imageUrl: _result5.url,
                          },
                          {
                            productId: producr_id,
                          }
                        )
                      );

                    case 18:
                      updateImage = _context28.sent;
                      _context28.next = 22;
                      break;

                    case 21:
                      return _context28.abrupt('return', res.json(Response(constant.statusCode.unauth, constant.validateMsg.notSupportedType)));

                    case 22:
                    case 'end':
                      return _context28.stop();
                  }
                }
              });
            });
            return _context29.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.Addproduct, savePrtoductData)));

          case 6:
          case 'end':
            return _context29.stop();
        }
      }
    });
  }

  uplodeProfileImageMethod().then(function (data) {});
}

function editProfil(req, res) {
  function editprofilrMethod() {
    var _req$body,
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
      dateObj,
      month,
      day,
      year,
      data,
      condition,
      saveUserData;

    return regeneratorRuntime.async(function editprofilrMethod$(_context30) {
      while (1) {
        switch ((_context30.prev = _context30.next)) {
          case 0:
            (_req$body = req.body),
              (first_name = _req$body.first_name),
              (last_name = _req$body.last_name),
              (email = _req$body.email),
              (password = _req$body.password),
              (phone_number = _req$body.phone_number),
              (address = _req$body.address),
              (city = _req$body.city),
              (state = _req$body.state),
              (country = _req$body.country),
              (zip_code = _req$body.zip_code),
              (profile_image_id = _req$body.profile_image_id),
              (date_of_birth = _req$body.date_of_birth);
            dateObj = new Date();
            month = dateObj.getUTCMonth() + 1; //months from 1-12

            day = dateObj.getUTCDate();
            year = dateObj.getUTCFullYear();
            newdate = year + '-' + month + '-' + day;
            data = {
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
            condition = {
              id: 'user_id',
            };
            _context30.next = 10;
            return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, data, condition));

          case 10:
            saveUserData = _context30.sent;

            if (!(saveUserData.code == 200)) {
              _context30.next = 15;
              break;
            }

            return _context30.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.Registration, saveUserData)));

          case 15:
            if (!(saveUserData.code == 409)) {
              _context30.next = 18;
              break;
            }

            console.log('saveUserData===>in else');
            return _context30.abrupt('return', res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist)));

          case 18:
          case 'end':
            return _context30.stop();
        }
      }
    });
  }

  editprofilrMethod().then(function (data) {});
}

function updateUserData(req, res) {
  function updateuserdataMethod() {
    var updatedata, condition, updateUserData;
    return regeneratorRuntime.async(function updateuserdataMethod$(_context31) {
      while (1) {
        switch ((_context31.prev = _context31.next)) {
          case 0:
            console.log(req.bodegistey);
            updatedata = {
              username: req.body.username,
              password: req.body.password,
            };
            condition = {
              id: req.body.id,
            };
            _context31.next = 5;
            return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, updatedata, condition));

          case 5:
            updateUserData = _context31.sent;

            if (!(updateUserData.code == 200)) {
              _context31.next = 10;
              break;
            }

            return _context31.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData)));

          case 10:
            return _context31.abrupt(
              'return',
              res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
            );

          case 11:
          case 'end':
            return _context31.stop();
        }
      }
    });
  }

  updateuserdataMethod().then(function (data) {});
}

function saveUser(req, res) {
  function saveUserMethod() {
    var _req$body2,
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
      isDuplictate,
      condition,
      checkDuplicate,
      dateObj,
      month,
      day,
      year,
      data,
      _condition2,
      saveUserData,
      successResponcetoJson,
      success,
      updateImage,
      cond,
      getStatus,
      finalData,
      admindata,
      title;

    return regeneratorRuntime.async(
      function saveUserMethod$(_context32) {
        while (1) {
          switch ((_context32.prev = _context32.next)) {
            case 0:
              _context32.prev = 0;
              (_req$body2 = req.body),
                (first_name = _req$body2.first_name),
                (last_name = _req$body2.last_name),
                (email = _req$body2.email),
                (password = _req$body2.password),
                (phone_number = _req$body2.phone_number),
                (address = _req$body2.address),
                (city = _req$body2.city),
                (state = _req$body2.state),
                (country = _req$body2.country),
                (zip_code = _req$body2.zip_code),
                (profile_image_id = _req$body2.profile_image_id),
                (date_of_birth = _req$body2.date_of_birth),
                (user_name = _req$body2.user_name),
                (billingaddress1 = _req$body2.billingaddress1),
                (billingaddress2 = _req$body2.billingaddress2),
                (billingcity = _req$body2.billingcity),
                (billingstate = _req$body2.billingstate),
                (billingzipcode = _req$body2.billingzipcode),
                (companyname = _req$body2.companyname),
                (role = _req$body2.role),
                (shippingaddress1 = _req$body2.shippingaddress1),
                (shippingaddress2 = _req$body2.shippingaddress2),
                (shippingcity = _req$body2.shippingcity),
                (shippingstate = _req$body2.shippingstate),
                (shippingzipcode = _req$body2.shippingzipcode),
                (id = _req$body2.id);
              isDuplictate = false;
              condition = 'select * from users where "email" iLike \''.concat(email, '\' and "is_deleted"=false;');
              _context32.next = 6;
              return regeneratorRuntime.awrap(bookshelf.knex.raw(condition));

            case 6:
              checkDuplicate = _context32.sent;

              if (!(checkDuplicate.rowCount > 0)) {
                _context32.next = 10;
                break;
              }

              isDuplictate = true;
              return _context32.abrupt(
                'return',
                res.json(
                  Response(constant.statusCode.alreadyExist, 'E-Mail Id you are trying is already been registered. Try with different Email-Id', {
                    emailError: 'emailError',
                  })
                )
              );

            case 10:
              if (isDuplictate) {
                _context32.next = 49;
                break;
              }

              dateObj = new Date();
              month = dateObj.getUTCMonth() + 1; //months from 1-12

              day = dateObj.getUTCDate();
              year = dateObj.getUTCFullYear();
              newdate = year + '-' + month + '-' + day;
              data = {
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
              _condition2 = {
                email: email,
              };
              _context32.next = 20;
              return regeneratorRuntime.awrap(common_query.saveRecordOnCondition(UserModel, data, _condition2));

            case 20:
              saveUserData = _context32.sent;

              if (!(saveUserData.code == 200)) {
                _context32.next = 46;
                break;
              }

              // console.log("*********saveUserData********",saveUserData);
              successResponcetoJson = JSON.stringify(saveUserData.success);
              success = JSON.parse(successResponcetoJson);
              _context32.next = 26;
              return regeneratorRuntime.awrap(
                common_query.saveRecord(imageModel, {
                  imageUrl: 'defult_path',
                  userId: success.id,
                })
              );

            case 26:
              updateImage = _context32.sent;

              if (!(updateImage.code == 200)) {
                _context32.next = 43;
                break;
              }

              cond = {
                isdeleted: false,
                settingname: 'emailsetting',
              };
              _context32.next = 31;
              return regeneratorRuntime.awrap(common_query.findAllData(settingModel, cond));

            case 31:
              getStatus = _context32.sent;
              finalData = getStatus.data.toJSON();

              if (!(getStatus.code == 200)) {
                _context32.next = 40;
                break;
              }

              admindata = finalData[0].settingvalue; //   email: "varuny.sdei@gmail.com"

              title = req.body.first_name + ' ' + req.body.last_name + ' Registration Activation Notification';
              utility.readTemplateSendMailV2(admindata.email, title, admindata, 'new_user', function (err, resp) {
                if (err) {
                  console.log('sign up err>>>>>', err);
                } else if (resp) {
                  console.log('signup up success');
                }
              });
              return _context32.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.Registration, saveUserData)));

            case 40:
              return _context32.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, {})));

            case 41:
              _context32.next = 44;
              break;

            case 43:
              return _context32.abrupt('return', res.json(Response(constant.statusCode.internalError, constant.validateMsg.internalError)));

            case 44:
              _context32.next = 49;
              break;

            case 46:
              if (!(saveUserData.code == 409)) {
                _context32.next = 49;
                break;
              }

              console.log('saveUserData===>in else');
              return _context32.abrupt('return', res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist)));

            case 49:
              _context32.next = 53;
              break;

            case 51:
              _context32.prev = 51;
              _context32.t0 = _context32['catch'](0);

            case 53:
            case 'end':
              return _context32.stop();
          }
        }
      },
      null,
      null,
      [[0, 51]]
    );
  }

  saveUserMethod().then(function (data) {});
} // function saveUser(req, res) {
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
  return new Promise(function (resolve, reject) {});
}

function login2(req, res) {
  res.json('working');
}

function login(req, res) {
  function loginMethod() {
    var condition, loginData, myObjStr, params, token, finalData;
    return regeneratorRuntime.async(
      function loginMethod$(_context33) {
        while (1) {
          switch ((_context33.prev = _context33.next)) {
            case 0:
              _context33.prev = 0;
              condition = {
                email: req.body.email,
                is_active: true,
              };
              _context33.next = 4;
              return regeneratorRuntime.awrap(
                common_query.findAllData(UserModel, condition)['catch'](function (err) {
                  throw err;
                })
              );

            case 4:
              loginData = _context33.sent;

              if (!(loginData.code == 200 && loginData.data.length > 0)) {
                _context33.next = 18;
                break;
              }

              myObjStr = JSON.stringify(loginData.data);
              myObjStr = JSON.parse(myObjStr);

              if (!(crypto.decrypt(myObjStr[0].password) == req.body.password)) {
                _context33.next = 15;
                break;
              }

              params = {
                _id: myObjStr[0].id,
              };
              token = jwt.sign(params, 'B2B');
              finalData = {
                loginData: loginData,
                token: token,
                params: params,
              };
              return _context33.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, finalData)));

            case 15:
              return _context33.abrupt('return', res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.invalidPassword)));

            case 16:
              _context33.next = 20;
              break;

            case 18:
              console.log('loginData===>in else');
              return _context33.abrupt(
                'return',
                res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.invalidEmailOrPassword, loginData))
              );

            case 20:
              _context33.next = 26;
              break;

            case 22:
              _context33.prev = 22;
              _context33.t0 = _context33['catch'](0);
              console.log('LOG3', _context33.t0);
              return _context33.abrupt('return', res.json(Response(constant.statusCode.internalError, _context33.t0)));

            case 26:
            case 'end':
              return _context33.stop();
          }
        }
      },
      null,
      null,
      [[0, 22]]
    );
  }

  loginMethod().then(function (data) {});
}

function test(req, res) {
  function loginMethod() {
    return regeneratorRuntime.async(function loginMethod$(_context34) {
      while (1) {
        switch ((_context34.prev = _context34.next)) {
          case 0:
            return _context34.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, 'i am safe')));

          case 1:
          case 'end':
            return _context34.stop();
        }
      }
    });
  }

  loginMethod().then(function (data) {});
}

function forgotPassword(req, res) {
  function forgotPasswordMethod() {
    var condition, userdata, timestamp, verifingLink, updatedobj, updateduserdata, myObjStr, userMailData;
    return regeneratorRuntime.async(function forgotPasswordMethod$(_context35) {
      while (1) {
        switch ((_context35.prev = _context35.next)) {
          case 0:
            condition = {
              email: req.body.email,
            };
            _context35.next = 3;
            return regeneratorRuntime.awrap(common_query.findAllData(UserModel, condition));

          case 3:
            userdata = _context35.sent;

            if (!userdata) {
              _context35.next = 19;
              break;
            }

            if (!(userdata.data.length > 0)) {
              _context35.next = 18;
              break;
            }

            timestamp = Number(new Date());
            verifingLink = utility.randomValueHex(20) + timestamp + utility.randomValueHex(10);
            updatedobj = {
              verifying_token: verifingLink,
            };
            _context35.next = 11;
            return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, updatedobj, condition));

          case 11:
            updateduserdata = _context35.sent;
            myObjStr = JSON.stringify(updateduserdata.data);
            myObjStr = JSON.parse(myObjStr);

            if (myObjStr) {
              userMailData = {
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

            return _context35.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.forgotPasswordSuccess)));

          case 18:
            return _context35.abrupt('return', res.json(Response(constant.statusCode.notFound, constant.messages.invalidEmail)));

          case 19:
          case 'end':
            return _context35.stop();
        }
      }
    });
  }

  forgotPasswordMethod().then(function (data) {});
}

function resetpassword(req, res) {
  function resetPasswordMethod() {
    var condition, userObj, myObjStr, cond, updatedobj, updateduserdata;
    return regeneratorRuntime.async(function resetPasswordMethod$(_context36) {
      while (1) {
        switch ((_context36.prev = _context36.next)) {
          case 0:
            console.log(req.body.verifying_token);

            if (!(req.body.password == '' || req.body.verifying_token == '')) {
              _context36.next = 5;
              break;
            }

            return _context36.abrupt('return', response.invalidPassword(res));

          case 5:
            condition = {
              verifying_token: req.body.verifying_token,
            };
            _context36.next = 8;
            return regeneratorRuntime.awrap(common_query.findAllData(UserModel, condition));

          case 8:
            userObj = _context36.sent;
            myObjStr = JSON.stringify(userObj.data);
            myObjStr1 = JSON.parse(myObjStr);

            if (!(myObjStr1.length > 0)) {
              _context36.next = 24;
              break;
            }

            cond = {
              id: myObjStr1[0].id,
            };
            updatedobj = {
              password: crypto.encrypt(req.body.password),
              verifying_token: '',
            };
            _context36.next = 16;
            return regeneratorRuntime.awrap(common_query.updateRecord(UserModel, updatedobj, cond));

          case 16:
            updateduserdata = _context36.sent;

            if (!updateduserdata) {
              _context36.next = 21;
              break;
            }

            return _context36.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.resetPasswordSuccess)));

          case 21:
            return _context36.abrupt('return', response.InternalServer(res, err));

          case 22:
            _context36.next = 25;
            break;

          case 24:
            return _context36.abrupt('return', res.json(Response(constant.statusCode.notFound, constant.messages.invalidToken)));

          case 25:
          case 'end':
            return _context36.stop();
        }
      }
    });
  }

  resetPasswordMethod().then(function (data) {});
}

function getUser(req, res) {
  function getUserMethod() {
    var sql;
    return regeneratorRuntime.async(
      function getUserMethod$(_context37) {
        while (1) {
          switch ((_context37.prev = _context37.next)) {
            case 0:
              _context37.prev = 0;
              sql = 'select * from users where "id"= '.concat(req.body.id, ' and "is_deleted"=false;'); // let sql = `select * from users where "id" in  (${req.body.id2},${req.body.id}) and "is_deleted"=false;`

              bookshelf.knex
                .raw(sql)
                .then(function (data) {
                  console.log(data);
                  var resData = data.rows[0].id == req.body.id ? data.rows[0] : data.rows[1].id;
                  return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, resData));
                })
                ['catch'](function (err) {
                  return res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound));
                });
              _context37.next = 8;
              break;

            case 5:
              _context37.prev = 5;
              _context37.t0 = _context37['catch'](0);
              return _context37.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 8:
            case 'end':
              return _context37.stop();
          }
        }
      },
      null,
      null,
      [[0, 5]]
    );
  }

  getUserMethod().then(function (data) {});
}

function getEmailBlastUser(req, res) {
  function getEmailBlastUserMethod() {
    var sql;
    return regeneratorRuntime.async(
      function getEmailBlastUserMethod$(_context38) {
        while (1) {
          switch ((_context38.prev = _context38.next)) {
            case 0:
              _context38.prev = 0;
              sql = 'select id,first_name,last_name,email from users where "is_emailblast"=true and "is_deleted"=false;';
              bookshelf.knex
                .raw(sql)
                .then(function (data) {
                  return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, data.rows));
                })
                ['catch'](function (err) {
                  return res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound));
                });
              _context38.next = 8;
              break;

            case 5:
              _context38.prev = 5;
              _context38.t0 = _context38['catch'](0);
              return _context38.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 8:
            case 'end':
              return _context38.stop();
          }
        }
      },
      null,
      null,
      [[0, 5]]
    );
  }

  getEmailBlastUserMethod().then(function (data) {});
}

function getOfferById(req, res) {
  function getOfferByIdMethod() {
    var socket, productId, product, sql, raw2;
    return regeneratorRuntime.async(
      function getOfferByIdMethod$(_context39) {
        while (1) {
          switch ((_context39.prev = _context39.next)) {
            case 0:
              _context39.prev = 0;
              // socket = req.app.get("io"); // console.log('socket', socket)

              if (req.body && req.body.id) {
                productId = req.body.id;
                sql =
                  'select c.*,O."paymentdetail",i."imageUrl",sum(c."total_amount") OVER() AS full_amount,a.type,a."producttype"\n        ,b.company_logo as b_companylogo ,s.company_logo as companylogo,\n        s.first_name as sellerFirst,p."productName" as product_name, p."releaseDate" as release_date,s.user_name as sellerusername,b.user_name as bidderusername,\n              s.last_name as sellerLast,s.term_shipping as termsShipping,\n              s.payment_mode as paymentMode,\n              s.payment_timing as paymentTiming,\n              s.additional_term as additionalTerms,\n              b.shipping_address as shippingAddress,\n              b.shippingaddress1 as shippingaddress1,\nb.shippingaddress2 as shippingaddress2,\nb.shippingcity as shippingcity,\nb.shippingstate as shippingstate,\nb.shippingzipcode as shippingzipcode,\n              b.first_name\n              as bidderFirst,b.last_name as bidderLast from counters c\n              LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"\n              LEFT OUTER JOIN images i on i."productId" = c."product_id"\n              LEFT OUTER JOIN users s on s.id = c."seller_id"\n              LEFT OUTER JOIN users b on b.id = c."bidder_id"\n              LEFT OUTER JOIN products p on p.id = c."product_id"\n              LEFT OUTER JOIN orders O on c.id = O."counter_id"\n                    WHERE (c."id" = ?) and c."is_deleted" = false;';
                raw2 = bookshelf.knex.raw(sql, [req.body.id]);
                raw2
                  .then(function (result) {
                    return res.json(Response(constant.statusCode.ok, constant.messages.offerFetchedSuccessfully, result));
                  })
                  ['catch'](function (err) {
                    console.log(err);
                    return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
                  });
              }

              _context39.next = 8;
              break;

            case 5:
              _context39.prev = 5;
              _context39.t0 = _context39['catch'](0);
              return _context39.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 8:
            case 'end':
              return _context39.stop();
          }
        }
      },
      null,
      null,
      [[0, 5]]
    );
  }

  getOfferByIdMethod().then(function (data) {});
}

function cancelOffer(req, res) {
  function async_call() {
    var chat_update, chat_con, coniter_con, up_counter, orderCon, fndata;
    return regeneratorRuntime.async(
      function async_call$(_context40) {
        while (1) {
          switch ((_context40.prev = _context40.next)) {
            case 0:
              _context40.prev = 0;

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
              chat_update = {
                isofferCanceled: true,
                isActionPerformedbyRecieved: true,
              };
              chat_con = {
                id: req.body.chat_id,
              };
              coniter_con = {
                id: req.body.counter_id,
              };
              up_counter = {
                is_deleted: true,
              };
              orderCon = {
                product_id: req.body.product_id,
                counter_id: req.body.counter_id,
              };
              _context40.next = 8;
              return regeneratorRuntime.awrap(
                common_query.updateRecord(ChatModel, chat_update, chat_con)['catch'](function (err) {
                  throw err;
                })
              );

            case 8:
              _context40.next = 10;
              return regeneratorRuntime.awrap(
                common_query.updateRecord(OrderModel, up_counter, orderCon)['catch'](function (err) {
                  throw err;
                })
              );

            case 10:
              _context40.next = 12;
              return regeneratorRuntime.awrap(
                common_query.updateRecord(CounterModel, up_counter, coniter_con)['catch'](function (err) {
                  throw err;
                })
              );

            case 12:
              fndata = _context40.sent;

              if (!(fndata.code == 200)) {
                _context40.next = 17;
                break;
              }

              return _context40.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.offerAccepted, {})));

            case 17:
              return _context40.abrupt(
                'return',
                res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
              );

            case 18:
              _context40.next = 23;
              break;

            case 20:
              _context40.prev = 20;
              _context40.t0 = _context40['catch'](0);
              return _context40.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 23:
            case 'end':
              return _context40.stop();
          }
        }
      },
      null,
      null,
      [[0, 20]]
    );
  }

  async_call();
}

function acceptOffer(req, res) {
  function acceptOfferMethod() {
    var dateObj, month, day, year, data, _orderdata2, notObj, condition_chat, sql, updatedata, condition, u_chat;

    return regeneratorRuntime.async(
      function acceptOfferMethod$(_context43) {
        while (1) {
          switch ((_context43.prev = _context43.next)) {
            case 0:
              _context43.prev = 0;
              dateObj = new Date();
              month = dateObj.getUTCMonth() + 1; //months from 1-12

              day = dateObj.getUTCDate();
              year = dateObj.getUTCFullYear();
              newdate = year + '-' + month + '-' + day;
              data = {
                counter_id: req.body.counter_id ? req.body.counter_id : null,
                status: req.body.status ? req.body.status : null,
                is_deleted: false,
                product_id: req.body.product_id ? req.body.product_id : null,
                createdbyId: req.body.createdbyId ? req.body.createdbyId : null,
                created_at: newdate,
              };
              console.log('req body in accept offer ', req.body);
              updateCounterStatus(req);
              _orderdata2 = {};
              _context43.next = 12;
              return regeneratorRuntime.awrap(common_query.saveRecord(OrderModel, data));

            case 12:
              _orderdata2 = _context43.sent;
              notObj = {
                created_by: data.createdbyId,
                content: 'accepted your offer',
                destnation_user_id: req.body.createdForId,
              };
              console.log(notObj);
              condition_chat = {
                o_id: req.body.counter_id.toString(),
                p_id: req.body.product_id.toString(),
              };
              sql = "select * from chats where message->'msg'->>\n      'offer_id'="
                .concat("'" + condition_chat.o_id + "'", "\nand message->'msg'->>'product_id'=")
                .concat("'" + condition_chat.p_id + "'"); // console.log('queryyyyyyyyyyyyyy_______________--', sql)

              bookshelf.knex.raw(sql).then(function _callee11(res) {
                var updatedata, condition, u_chat;
                return regeneratorRuntime.async(function _callee11$(_context41) {
                  while (1) {
                    switch ((_context41.prev = _context41.next)) {
                      case 0:
                        /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
                        updatedata = {
                          isActionPerformedbyRecieved: true,
                          isofferAccepted: true,
                        };

                        if (!(res && res.rows[0] && res.rows[0].id)) {
                          _context41.next = 10;
                          break;
                        }

                        condition = {
                          id: res.rows[0].id,
                        };
                        console.log('res = > ' + res); // console.log('data.rows[0]data.rows[0]', res.rows[0])

                        chat_room_id = res.rows[0].room_id;

                        if (!res.rows[0].id) {
                          _context41.next = 10;
                          break;
                        }

                        _context41.next = 8;
                        return regeneratorRuntime.awrap(common_query.updateRecord(ChatModel, updatedata, condition));

                      case 8:
                        u_chat = _context41.sent;
                        console.log('u_chat accept 1233333asunc ', u_chat);

                      case 10:
                      case 'end':
                        return _context41.stop();
                    }
                  }
                });
              });

              if (!req.body.chat_id) {
                _context43.next = 25;
                break;
              }

              /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
              updatedata = {
                isActionPerformedbyRecieved: true,
                isofferAccepted: true,
              };
              condition = {
                id: req.body.chat_id ? req.body.chat_id : chatId,
              };
              _context43.next = 23;
              return regeneratorRuntime.awrap(common_query.updateRecord(ChatModel, updatedata, condition));

            case 23:
              u_chat = _context43.sent;
              console.log('u_chat accept', u_chat);

            case 25:
              utility.addNotification(notObj, function (err, resp) {
                if (err) {
                  console.log('Error adding notification in accept offer', err);
                } else {
                  console.log('response after calling common add notification in accept offer', resp);
                }
              });

              if (!(_orderdata2.code == 200)) {
                _context43.next = 34;
                break;
              }

              if (req.body.chat_id) {
                _context43.next = 31;
                break;
              }

              bookshelf.knex.raw(sql).then(function _callee12(data) {
                return regeneratorRuntime.async(function _callee12$(_context42) {
                  while (1) {
                    switch ((_context42.prev = _context42.next)) {
                      case 0:
                        return _context42.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.offerAccepted, _orderdata2)));

                      case 1:
                      case 'end':
                        return _context42.stop();
                    }
                  }
                });
              });
              _context43.next = 32;
              break;

            case 31:
              return _context43.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.offerAccepted, _orderdata2)));

            case 32:
              _context43.next = 36;
              break;

            case 34:
              console.log('else acceot offer record', _orderdata2);
              return _context43.abrupt(
                'return',
                res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
              );

            case 36:
              _context43.next = 42;
              break;

            case 38:
              _context43.prev = 38;
              _context43.t0 = _context43['catch'](0);
              console.log('accept offer  catch err===>', _context43.t0);
              return _context43.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 42:
            case 'end':
              return _context43.stop();
          }
        }
      },
      null,
      null,
      [[0, 38]]
    );
  }

  acceptOfferMethod().then(function (data) {});
}

function updateCounterStatus(req) {
  function updateCounterStatusMethod() {
    var updatedata, condition;
    return regeneratorRuntime.async(function updateCounterStatusMethod$(_context44) {
      while (1) {
        switch ((_context44.prev = _context44.next)) {
          case 0:
            updatedata = {
              status: req.body.status ? req.body.status : null,
            };
            condition = {
              id: req.body.counter_id,
            };
            _context44.next = 4;
            return regeneratorRuntime.awrap(common_query.updateRecord(CounterModel, updatedata, condition));

          case 4:
          case 'end':
            return _context44.stop();
        }
      }
    });
  }

  updateCounterStatusMethod().then(function (data) {});
}

function declineOffer(req, res) {
  function declineMethod() {
    var dateObj, month, day, year, data, condition_chat, sql, updatedata, condition, u_chat, _orderdata3, notObj;

    return regeneratorRuntime.async(
      function declineMethod$(_context47) {
        while (1) {
          switch ((_context47.prev = _context47.next)) {
            case 0:
              _context47.prev = 0;
              console.log('declineOffer', req.body);
              dateObj = new Date();
              month = dateObj.getUTCMonth() + 1; //months from 1-12

              day = dateObj.getUTCDate();
              year = dateObj.getUTCFullYear();
              newdate = year + '-' + month + '-' + day;
              data = {
                counter_id: req.body.counter_id ? req.body.counter_id : null,
                status: req.body.status ? req.body.status : null,
                is_deleted: false,
                product_id: req.body.product_id ? req.body.product_id : null,
                createdbyId: req.body.createdbyId ? req.body.createdbyId : null,
                created_at: newdate,
              };
              updateCounterStatus(req);
              condition_chat = {
                o_id: req.body.counter_id.toString(),
                p_id: req.body.product_id.toString(),
              };
              sql = "select * from chats where message->'msg'->>\n      'offer_id'="
                .concat("'" + condition_chat.o_id + "'", "\nand message->'msg'->>'product_id'=")
                .concat("'" + condition_chat.p_id + "'"); // console.log('queryyyyyyyyyyyyyy_______________--', sql)

              bookshelf.knex.raw(sql).then(function _callee13(data) {
                var updatedata, condition, u_chat;
                return regeneratorRuntime.async(function _callee13$(_context45) {
                  while (1) {
                    switch ((_context45.prev = _context45.next)) {
                      case 0:
                        /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted true */
                        updatedata = {
                          isActionPerformedbyRecieved: true,
                          isofferAccepted: false,
                        };

                        if (!data.rows[0]) {
                          _context45.next = 9;
                          break;
                        }

                        condition = {
                          id: data.rows[0].id,
                        };
                        console.log('data.rows[0]data.rows[0] 434343434343', data.rows[0]);
                        chat_room_id = data.rows[0].room_id;
                        _context45.next = 7;
                        return regeneratorRuntime.awrap(common_query.updateRecord(ChatModel, updatedata, condition));

                      case 7:
                        u_chat = _context45.sent;
                        console.log('u_chat accept 43434343444 ', u_chat);

                      case 9:
                      case 'end':
                        return _context45.stop();
                    }
                  }
                });
              });

              if (!req.body.chat_id) {
                _context47.next = 19;
                break;
              }

              /**update the chat by id you getting is isActionperformebyreciever isofferaccpeted false */
              updatedata = {
                isActionPerformedbyRecieved: true,
                isofferAccepted: false,
              };
              condition = {
                id: req.body.chat_id,
              };
              _context47.next = 17;
              return regeneratorRuntime.awrap(common_query.updateRecord(ChatModel, updatedata, condition));

            case 17:
              u_chat = _context47.sent;
              console.log('u_chat decline', u_chat);

            case 19:
              _orderdata3 = {};
              _context47.next = 22;
              return regeneratorRuntime.awrap(common_query.saveRecord(OrderModel, data));

            case 22:
              _orderdata3 = _context47.sent;
              notObj = {
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

              if (!(_orderdata3.code == 200)) {
                _context47.next = 33;
                break;
              }

              if (req.body.chat_id) {
                _context47.next = 30;
                break;
              }

              bookshelf.knex.raw(sql).then(function _callee14(data) {
                return regeneratorRuntime.async(function _callee14$(_context46) {
                  while (1) {
                    switch ((_context46.prev = _context46.next)) {
                      case 0:
                        return _context46.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.offerDecline, _orderdata3)));

                      case 1:
                      case 'end':
                        return _context46.stop();
                    }
                  }
                });
              });
              _context47.next = 31;
              break;

            case 30:
              return _context47.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.offerDecline, _orderdata3)));

            case 31:
              _context47.next = 34;
              break;

            case 33:
              return _context47.abrupt(
                'return',
                res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
              );

            case 34:
              _context47.next = 39;
              break;

            case 36:
              _context47.prev = 36;
              _context47.t0 = _context47['catch'](0);
              return _context47.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 39:
            case 'end':
              return _context47.stop();
          }
        }
      },
      null,
      null,
      [[0, 36]]
    );
  }

  declineMethod().then(function (data) {});
}

function confirmDelivery(req, res) {
  function confirmDeliveryMethod() {
    var updatedata, condition, _updateUserData5, notObj, sql, raw2;

    return regeneratorRuntime.async(
      function confirmDeliveryMethod$(_context48) {
        while (1) {
          switch ((_context48.prev = _context48.next)) {
            case 0:
              _context48.prev = 0;
              updatedata = {
                delivered: req.body.delivered,
              };
              condition = {
                id: req.body.id,
              };
              _context48.next = 5;
              return regeneratorRuntime.awrap(common_query.updateRecord(OrderModel, updatedata, condition));

            case 5:
              _updateUserData5 = _context48.sent;
              notObj = {
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

              if (!(_updateUserData5.code == 200)) {
                _context48.next = 14;
                break;
              }

              sql =
                'select c.*,O."status",O."createdbyId",O."track_no",O."courier",O."paymentdetail", O."delivered" from counters c\n                      LEFT OUTER JOIN orders O on c.id = O."counter_id"\n                      WHERE (c."id" = ?) and c."is_deleted" = false;';
              raw2 = bookshelf.knex.raw(sql, [req.body.counter_id]);
              raw2.then(function (result) {
                return res.json(Response(constant.statusCode.ok, constant.messages.confirmdelivery, result));
              });
              _context48.next = 15;
              break;

            case 14:
              return _context48.abrupt(
                'return',
                res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result))
              );

            case 15:
              _context48.next = 20;
              break;

            case 17:
              _context48.prev = 17;
              _context48.t0 = _context48['catch'](0);
              return _context48.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 20:
            case 'end':
              return _context48.stop();
          }
        }
      },
      null,
      null,
      [[0, 17]]
    );
  }

  confirmDeliveryMethod().then(function (data) {});
} //get all users

function getAllUsers(req, res) {
  function getAllUsersMethod() {
    var limit, page, isdeleted, offset, columnName, sortingOrder, searchChar, sql;
    return regeneratorRuntime.async(
      function getAllUsersMethod$(_context49) {
        while (1) {
          switch ((_context49.prev = _context49.next)) {
            case 0:
              _context49.prev = 0;
              limit = req.body.pagePerLimit || 10;
              page = req.body.currentPage - 1 || 0;
              isdeleted = req.body.isdeleted;
              offset = limit * page;
              columnName = req.body.columnName || 'first_name'; // let sortingOrder =req.body.sortingOrder + " " + "NULL LAST"|| "ASC NULL LA|| "ASC ";

              sortingOrder = req.body.sortingOrder || 'ASC';

              if (req.body.sortingOrder == 'NORMAL') {
                sortingOrder = 'ASC';
                columnName = 'first_name';
              }

              if (req.body.searchChar) {
                searchChar = '("user_name" ilike \'%'
                  .concat(req.body.searchChar, '%\' or "first_name" ilike \'%')
                  .concat(req.body.searchChar, '%\' or "last_name" ilike \'%')
                  .concat(req.body.searchChar, "%') and ");
              }

              sql = 'SELECT *, count(*) OVER()\n      AS full_count FROM users WHERE '
                .concat(searchChar ? searchChar : '', 'is_deleted=')
                .concat(isdeleted, '\n       AND ("role"=\'user\' OR "role" IS NULL) ORDER BY "')
                .concat(columnName, '" ')
                .concat(sortingOrder, ' OFFSET ')
                .concat(offset, ' LIMIT ')
                .concat(limit, ';'); // let sql = `SELECT *, count(*) OVER() AS full_count FROM users WHERE is_deleted=? ORDER BY ${columnName} OFFSET ? LIMIT ?;`
              // bookshelf.knex.raw(sql).then(data => {
              //   return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
              // })

              bookshelf.knex
                .raw(sql)
                .then(function (data) {
                  return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
                })
                ['catch'](function (err) {
                  return res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound));
                });
              _context49.next = 16;
              break;

            case 13:
              _context49.prev = 13;
              _context49.t0 = _context49['catch'](0);
              return _context49.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 16:
            case 'end':
              return _context49.stop();
          }
        }
      },
      null,
      null,
      [[0, 13]]
    );
  }

  getAllUsersMethod().then(function (data) {});
}

function exportTransactionList(req, res) {
  function exportTransactionListMethod() {
    var sql;
    return regeneratorRuntime.async(
      function exportTransactionListMethod$(_context50) {
        while (1) {
          switch ((_context50.prev = _context50.next)) {
            case 0:
              _context50.prev = 0;
              sql =
                '\n      Select  P."id" as "Product_id", P."productName" as "Productname", C."type_of" as "Type", CONCAT(S.first_name,\' \',S.last_name) as "Seller_name", CONCAT(B.first_name,\' \',B.last_name) as "Bidder_name", C."total_amount" as "Amount"\n      from orders O\n      LEFT OUTER JOIN counters C ON O."counter_id" = C.id\n      LEFT OUTER JOIN products P ON O."product_id" = P.id\n      LEFT OUTER JOIN images I ON P.id = I."productId"\n      LEFT OUTER JOIN users S ON S.id = C."seller_id"\n      LEFT OUTER JOIN users B ON B.id = C."bidder_id"\n      where O.is_deleted = false and O."status" LIKE \'%accept%\' and O."track_no" is not NULL and O.delivered = true\n      ORDER BY P."productName" ASC\n      ';
              bookshelf.knex
                .raw(sql)
                .then(function (data) {
                  return res.json(Response(constant.statusCode.ok, constant.messages.transactionList, data));
                })
                ['catch'](function (err) {
                  return res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound));
                });
              _context50.next = 8;
              break;

            case 5:
              _context50.prev = 5;
              _context50.t0 = _context50['catch'](0);
              return _context50.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 8:
            case 'end':
              return _context50.stop();
          }
        }
      },
      null,
      null,
      [[0, 5]]
    );
  }

  exportTransactionListMethod().then(function (data) {});
} //get all Transaction List

function getTransactionList(req, res) {
  function getTransactionListMethod() {
    var limit, page, isdeleted, offset, columnName, sortingOrder, searchChar, sql;
    return regeneratorRuntime.async(
      function getTransactionListMethod$(_context51) {
        while (1) {
          switch ((_context51.prev = _context51.next)) {
            case 0:
              _context51.prev = 0;
              limit = req.body.pagePerLimit || 10;
              page = req.body.currentPage - 1 || 0;
              isdeleted = req.body.isdeleted;
              offset = limit * page;
              columnName = req.body.columnName || 'productName';
              sortingOrder = req.body.sortingOrder || 'ASC';

              if (req.body.sortingOrder == 'NORMAL') {
                sortingOrder = 'ASC';
                columnName = 'productName';
              }

              if (req.body.searchChar) {
                searchChar = '("productName" ilike \'%'.concat(req.body.searchChar, "%') and ");
              } // let sql = `SELECT *, count(*) OVER() AS full_count FROM users WHERE  ${searchChar ? searchChar : ''}is_deleted=${isdeleted} AND ("role"='user' OR "role" IS NULL) ORDER BY "${columnName}" ${sortingOrder} OFFSET ${offset} LIMIT ${limit};`

              sql = '\n      Select O.*,C."type_of", C."total_amount", count(*) OVER() AS full_count, P."productName", I."imageUrl", CONCAT(S.first_name,\' \',S.last_name) as "seller_name", CONCAT(B.first_name,\' \',B.last_name) as "bidder_name"\n      from orders O\n      LEFT OUTER JOIN counters C ON O."counter_id" = C.id\n      LEFT OUTER JOIN products P ON O."product_id" = P.id\n      LEFT OUTER JOIN images I ON P.id = I."productId"\n      LEFT OUTER JOIN users S ON S.id = C."seller_id"\n      LEFT OUTER JOIN users B ON B.id = C."bidder_id"\n      where '
                .concat(
                  searchChar ? searchChar : '',
                  ' O.is_deleted = false and O."status" LIKE \'%accept%\' and O."track_no" is not NULL and O.delivered = true\n      Group By O.id, C."type_of", C."total_amount", P."productName", I."imageUrl", S."first_name", S."last_name", B.first_name, B.last_name\n      ORDER BY "'
                )
                .concat(columnName, '" ')
                .concat(sortingOrder, ' OFFSET ')
                .concat(offset, ' LIMIT ')
                .concat(limit, ';\n      ');
              bookshelf.knex
                .raw(sql)
                .then(function (data) {
                  return res.json(Response(constant.statusCode.ok, constant.messages.transactionList, data));
                })
                ['catch'](function (err) {
                  return res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound));
                });
              _context51.next = 16;
              break;

            case 13:
              _context51.prev = 13;
              _context51.t0 = _context51['catch'](0);
              return _context51.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 16:
            case 'end':
              return _context51.stop();
          }
        }
      },
      null,
      null,
      [[0, 13]]
    );
  }

  getTransactionListMethod().then(function (data) {});
} //get all user details

function userdetails(req, res, next) {
  function userdetailsMethod() {
    var getDraftListDecryptedResult, conditions, _filter;

    return regeneratorRuntime.async(function userdetailsMethod$(_context52) {
      while (1) {
        switch ((_context52.prev = _context52.next)) {
          case 0:
            _filter = function _ref(qb) {
              qb.joinRaw('LEFT JOIN images ON (users.id = images."userId")');
            };

            getDraftListDecryptedResult = [];
            conditions = {
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
              ['catch'](function (err) {
                console.log(err);

                __debug(err);

                res.json({
                  status: config.statusCode.error,
                  data: [],
                  message: i18n.__('INTERNAL_ERROR'),
                });
              });

          case 4:
          case 'end':
            return _context52.stop();
        }
      }
    });
  }

  userdetailsMethod().then(function (data) {});
} // function emailVerification(req, res) {
//   async function async_call() {
//     try {
//     } catch (error) {
//       return res.json(Response(constant.statusCode.internalError))
//     }
//   } async_call()
// }
// Varun created WatchList feature (10-04-2020)

function AddWatchList(req, res) {
  function saveWatchListMethod() {
    var dateObj,
      month,
      day,
      year,
      userId,
      productId,
      sql,
      watchlistData,
      array1,
      watchRecord,
      updatedata,
      condition,
      updateWatchListData,
      watchlistdata,
      saveWatchListData;
    return regeneratorRuntime.async(
      function saveWatchListMethod$(_context53) {
        while (1) {
          switch ((_context53.prev = _context53.next)) {
            case 0:
              _context53.prev = 0;
              dateObj = new Date();
              month = dateObj.getUTCMonth() + 1; //months from 1-12

              day = dateObj.getUTCDate();
              year = dateObj.getUTCFullYear();
              newdate = year + '-' + month + '-' + day;
              userId = parseInt(req.body.userId);
              productId = parseInt(req.body.productId);
              sql = 'select * from watchlists where "user_id"='.concat(userId, ' and "product_id"=').concat(productId, ';');
              _context53.next = 11;
              return regeneratorRuntime.awrap(bookshelf.knex.raw(sql));

            case 11:
              watchlistData = _context53.sent;
              array1 = watchlistData.rows;
              watchRecord = [];
              array1.forEach(function (element) {
                var output = JSON.stringify(element);
                var output1 = JSON.parse(output);
                watchRecord.push(output1);
              });
              console.log(watchRecord[0]);

              if (!(watchlistData.rowCount > 0)) {
                _context53.next = 30;
                break;
              }

              updatedata = {
                updated_at: newdate,
                status: watchRecord[0].status == 1 ? 0 : 1,
              };
              condition = {
                id: watchRecord[0].id,
              };
              _context53.next = 21;
              return regeneratorRuntime.awrap(common_query.updateRecord(WatchListModel, updatedata, condition));

            case 21:
              updateWatchListData = _context53.sent;
              console.log(updateWatchListData.success);

              if (!(updateWatchListData.code == 200)) {
                _context53.next = 27;
                break;
              }

              return _context53.abrupt(
                'return',
                res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateWatchListData.success))
              );

            case 27:
              return _context53.abrupt(
                'return',
                res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
              );

            case 28:
              _context53.next = 40;
              break;

            case 30:
              watchlistdata = {
                user_id: userId ? userId : null,
                product_id: productId ? productId : null,
                status: 1,
                created_at: newdate,
                updated_at: newdate,
              };
              _context53.next = 33;
              return regeneratorRuntime.awrap(common_query.saveRecord(WatchListModel, watchlistdata));

            case 33:
              saveWatchListData = _context53.sent;
              console.log(saveWatchListData);

              if (!(saveWatchListData.code == 200)) {
                _context53.next = 39;
                break;
              }

              return _context53.abrupt(
                'return',
                res.json(Response(constant.statusCode.ok, constant.messages.Registration, saveWatchListData.success))
              );

            case 39:
              return _context53.abrupt('return', res.json(Response(constant.statusCode.internalError, constant.validateMsg.internalError)));

            case 40:
              _context53.next = 45;
              break;

            case 42:
              _context53.prev = 42;
              _context53.t0 = _context53['catch'](0);
              console.log(_context53.t0);

            case 45:
            case 'end':
              return _context53.stop();
          }
        }
      },
      null,
      null,
      [[0, 42]]
    );
  }

  saveWatchListMethod().then(function (data) {});
}

function getWatchListData(req, res) {
  function getWatchListMethod() {
    var userId, productId, sql, watchlistData, array1, watchRecord;
    return regeneratorRuntime.async(
      function getWatchListMethod$(_context54) {
        while (1) {
          switch ((_context54.prev = _context54.next)) {
            case 0:
              _context54.prev = 0;
              userId = parseInt(req.body.userId);
              productId = parseInt(req.body.productId);
              sql = 'select * from watchlists where "user_id"='.concat(userId, ' and "product_id"=').concat(productId, ';');
              _context54.next = 6;
              return regeneratorRuntime.awrap(bookshelf.knex.raw(sql));

            case 6:
              watchlistData = _context54.sent;
              array1 = watchlistData.rows;
              watchRecord = [];
              array1.forEach(function (element) {
                var output = JSON.stringify(element);
                var output1 = JSON.parse(output);
                watchRecord.push(output1);
              });

              if (!(watchlistData.rowCount > 0)) {
                _context54.next = 14;
                break;
              }

              return _context54.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, watchRecord[0])));

            case 14:
              return _context54.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError)));

            case 15:
              _context54.next = 20;
              break;

            case 17:
              _context54.prev = 17;
              _context54.t0 = _context54['catch'](0);
              console.log(_context54.t0);

            case 20:
            case 'end':
              return _context54.stop();
          }
        }
      },
      null,
      null,
      [[0, 17]]
    );
  }

  getWatchListMethod().then(function (data) {});
}

function getAllWatchListData(req, res) {
  function getAllWatchListMethod() {
    var userId, sql, watchlistData, array1, watchRecord;
    return regeneratorRuntime.async(
      function getAllWatchListMethod$(_context55) {
        while (1) {
          switch ((_context55.prev = _context55.next)) {
            case 0:
              _context55.prev = 0;
              userId = parseInt(req.body.userId);
              sql = 'Select P.*,I."imageUrl", MIN(a.amount) as BoxLowestAsk, MAX(b.amount) as BoxHighestBid , MIN(c.amount) as CaseLowestAsk, MAX(d.amount) as CaseHighestBid from watchlists as wl left join products as P on wl.product_id=P.id\n      LEFT OUTER JOIN images I on P.id = I."productId"\n      LEFT OUTER JOIN bid_and_ask a on P.id = a."productId" and a."request" = \'asks\' and a."type"=\'Box\' and a.isdeleted = false and a.isactive = false\n      LEFT OUTER JOIN bid_and_ask b on P.id = b."productId" and b."request" = \'bids\' and b."type"=\'Box\' and b.isdeleted = false and b.isactive = false\n      LEFT OUTER JOIN bid_and_ask c on P.id = c."productId" and c."request" = \'asks\' and c."type"=\'Case\' and c.isdeleted = false and c.isactive = false\n      LEFT OUTER JOIN bid_and_ask d on P.id = d."productId" and d."request" = \'bids\' and d."type"=\'Case\'  and d.isdeleted = false and d.isactive = false\n      LEFT OUTER JOIN bid_and_ask t on P.id = t."productId" and t.isdeleted = false\n       where wl."user_id"='.concat(
                userId,
                ' AND wl.status=1 AND P."isdeleted"= false GROUP BY t."productId", P.id ,P."productName" ,a."request" , b."request" ,a."type",b."type",i."imageUrl",c."request",d."request",c."type",d."type"\n       ORDER BY P."productName"'
              );
              _context55.next = 5;
              return regeneratorRuntime.awrap(bookshelf.knex.raw(sql));

            case 5:
              watchlistData = _context55.sent;
              array1 = watchlistData.rows;
              watchRecord = [];
              array1.forEach(function (element) {
                var output = JSON.stringify(element);
                var output1 = JSON.parse(output);
                watchRecord.push(output1);
              });

              if (!(watchlistData.rowCount > 0)) {
                _context55.next = 14;
                break;
              }

              return _context55.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, watchRecord)));

            case 14:
              return _context55.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError)));

            case 15:
              _context55.next = 20;
              break;

            case 17:
              _context55.prev = 17;
              _context55.t0 = _context55['catch'](0);
              console.log(_context55.t0);

            case 20:
            case 'end':
              return _context55.stop();
          }
        }
      },
      null,
      null,
      [[0, 17]]
    );
  }

  getAllWatchListMethod().then(function (data) {});
} // GET ALL ADMIN USER

function getAllAdminUsers(req, res) {
  function getAllAdminUsersMethod() {
    var limit, page, isdeleted, offset, columnName, sortingOrder, searchChar, sql;
    return regeneratorRuntime.async(
      function getAllAdminUsersMethod$(_context56) {
        while (1) {
          switch ((_context56.prev = _context56.next)) {
            case 0:
              _context56.prev = 0;
              limit = req.body.pagePerLimit || 10;
              page = req.body.currentPage - 1 || 0;
              isdeleted = req.body.isdeleted;
              offset = limit * page;
              columnName = req.body.columnName || 'first_name';
              sortingOrder = req.body.sortingOrder || 'ASC';

              if (req.body.sortingOrder == 'NORMAL') {
                sortingOrder = 'ASC';
                columnName = 'first_name';
              }

              if (req.body.searchChar) {
                searchChar = '("first_name" ilike \'%'
                  .concat(req.body.searchChar, '%\' or "last_name" ilike \'%')
                  .concat(req.body.searchChar, "%') and ");
              }

              sql = 'SELECT *, count(*) OVER() AS full_count FROM users WHERE '
                .concat(searchChar ? searchChar : '', 'is_deleted=')
                .concat(isdeleted, " and role='admin' ORDER BY \"")
                .concat(columnName, '" ')
                .concat(sortingOrder, ' OFFSET ')
                .concat(offset, ' LIMIT ')
                .concat(limit, ';'); // let sql = `SELECT *, count(*) OVER() AS full_count FROM users WHERE is_deleted=? ORDER BY ${columnName} OFFSET ? LIMIT ?;`
              // bookshelf.knex.raw(sql).then(data => {
              //   return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
              // })

              bookshelf.knex
                .raw(sql)
                .then(function (data) {
                  return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
                })
                ['catch'](function (err) {
                  return res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound));
                });
              _context56.next = 16;
              break;

            case 13:
              _context56.prev = 13;
              _context56.t0 = _context56['catch'](0);
              return _context56.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 16:
            case 'end':
              return _context56.stop();
          }
        }
      },
      null,
      null,
      [[0, 13]]
    );
  }

  getAllAdminUsersMethod().then(function (data) {});
} // To add Notification by Saurabh 16/5/2020

function addNotification(req, res) {
  function addNotification() {
    var dateObj, month, day, year, data, notificationdata;
    return regeneratorRuntime.async(
      function addNotification$(_context57) {
        while (1) {
          switch ((_context57.prev = _context57.next)) {
            case 0:
              _context57.prev = 0;
              dateObj = new Date();
              month = dateObj.getUTCMonth() + 1; //months from 1-12

              day = dateObj.getUTCDate();
              year = dateObj.getUTCFullYear();
              newdate = year + '-' + month + '-' + day;
              data = {
                created_by: req.body.created_by ? req.body.created_by : null,
                content: req.body.content ? req.body.content : null,
                destnation_user_id: req.body.destnation_user_id ? req.body.destnation_user_id : null,
                is_deleted: false,
                is_read: false,
              };
              _context57.next = 9;
              return regeneratorRuntime.awrap(common_query.saveRecord(NotificationModel, data));

            case 9:
              notificationdata = _context57.sent;

              if (!(notificationdata.code == 200)) {
                _context57.next = 14;
                break;
              }

              return _context57.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.notificationAddSuccess, orderdata)));

            case 14:
              console.log('else in notification data', orderdata);
              return _context57.abrupt(
                'return',
                res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
              );

            case 16:
              _context57.next = 22;
              break;

            case 18:
              _context57.prev = 18;
              _context57.t0 = _context57['catch'](0);
              console.log('add notification catch err===>', _context57.t0);
              return _context57.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 22:
            case 'end':
              return _context57.stop();
          }
        }
      },
      null,
      null,
      [[0, 18]]
    );
  }

  addNotification().then(function (data) {});
} // To get notification by user id By Saurabh 16/5/2020

function getNotificationByUserId(req, res) {
  function getNotificationByUserId() {
    var userId, limit, page, is_read, offset, columnName, sortingOrder, sql, countsql, raw2;
    return regeneratorRuntime.async(
      function getNotificationByUserId$(_context58) {
        while (1) {
          switch ((_context58.prev = _context58.next)) {
            case 0:
              console.log('get notification function calling at backend*******', req.body);
              _context58.prev = 1;

              if (req.body && req.body.loggedUser) {
                userId = parseInt(req.body.loggedUser);
                console.log('req.body in get notificatins====>', req.body.loggedUser);
                limit = req.body.pagePerLimit || 10;
                page = req.body.currentPage - 1 || 0;
                is_read = req.body.is_read || 'false';
                offset = limit * page;
                columnName = req.body.columnName || 'created_at';
                sortingOrder = req.body.sortingOrder || 'DESC';

                if (req.body.sortingOrder == 'NORMAL') {
                  sortingOrder = 'DESC';
                  columnName = 'created_at';
                }

                if (req.body.is_read == 'all') {
                  sql = 'select n.*,count(*) OVER() AS full_count,u.first_name as sendby_firstname,u.last_name as sentby_lastname from notifications n LEFT OUTER JOIN users u on u.id = n."created_by" where n."is_deleted"=false  and n."destnation_user_id"='
                    .concat(userId, ' ORDER BY "')
                    .concat(columnName, '" ')
                    .concat(sortingOrder, ' OFFSET ')
                    .concat(offset, ' LIMIT ')
                    .concat(limit);
                } else {
                  sql = 'select n.*,count(*) OVER() AS full_count,u.first_name as sendby_firstname,u.last_name as sentby_lastname from notifications n LEFT OUTER JOIN users u on u.id = n."created_by" where n."is_deleted"=false and n."is_read"='
                    .concat(is_read, ' and n."destnation_user_id"=')
                    .concat(userId, ' ORDER BY "')
                    .concat(columnName, '" ')
                    .concat(sortingOrder, ' OFFSET ')
                    .concat(offset, ' LIMIT ')
                    .concat(limit);
                }

                countsql = 'select * from notifications where destnation_user_id ='.concat(userId, ' and is_deleted =false and is_read=false;');
                raw2 = bookshelf.knex.raw(sql); // console.log('query result in get notificatins=====>', raw2)

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
                      ['catch'](function (err) {
                        console.log(err);
                        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.commonError));
                      });
                  })
                  ['catch'](function (err) {
                    console.log(err);
                    return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.commonError));
                  });
              }

              _context58.next = 8;
              break;

            case 5:
              _context58.prev = 5;
              _context58.t0 = _context58['catch'](1);
              return _context58.abrupt('return', res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError)));

            case 8:
            case 'end':
              return _context58.stop();
          }
        }
      },
      null,
      null,
      [[1, 5]]
    );
  }

  getNotificationByUserId().then(function (data) {});
} // To mark notification as read by Saurabh 16/5/2020

function readNotification(req, res) {
  function readNotification() {
    var updatedata, condition, updateUserData;
    return regeneratorRuntime.async(function readNotification$(_context59) {
      while (1) {
        switch ((_context59.prev = _context59.next)) {
          case 0:
            updatedata = {
              is_read: true,
            };
            condition = {
              id: req.body.id,
            };
            _context59.next = 4;
            return regeneratorRuntime.awrap(common_query.updateRecord(NotificationModel, updatedata, condition));

          case 4:
            updateUserData = _context59.sent;

            if (!(updateUserData.code == 200)) {
              _context59.next = 9;
              break;
            }

            return _context59.abrupt('return', res.json(Response(constant.statusCode.ok, constant.messages.notificationReadSuccess, updateUserData)));

          case 9:
            return _context59.abrupt(
              'return',
              res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
            );

          case 10:
          case 'end':
            return _context59.stop();
        }
      }
    });
  }

  readNotification().then(function (data) {});
} // To delete notification by Saurabh 16/5/2020

function deleteNotification(req, res) {
  function deleteNotification() {
    var updatedata, condition, updateUserData;
    return regeneratorRuntime.async(function deleteNotification$(_context60) {
      while (1) {
        switch ((_context60.prev = _context60.next)) {
          case 0:
            updatedata = {
              is_deleted: true,
            };
            condition = {
              id: req.body.id,
            };
            _context60.next = 4;
            return regeneratorRuntime.awrap(common_query.updateRecord(NotificationModel, updatedata, condition));

          case 4:
            updateUserData = _context60.sent;

            if (!(updateUserData.code == 200)) {
              _context60.next = 9;
              break;
            }

            return _context60.abrupt(
              'return',
              res.json(Response(constant.statusCode.ok, constant.messages.notificationDeleteSuccess, updateUserData))
            );

          case 9:
            return _context60.abrupt(
              'return',
              res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
            );

          case 10:
          case 'end':
            return _context60.stop();
        }
      }
    });
  }

  deleteNotification().then(function (data) {});
}
