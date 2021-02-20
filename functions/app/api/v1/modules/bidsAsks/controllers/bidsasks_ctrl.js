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
var bidsasksModel = loader.loadModel('/bidsAsks/models/bidsasks_models');
var UserModel = loader.loadModel('/user/models/user_models');
var imageModel = loader.loadModel('/images/models/image_models');
var roomModel = require('../models/room_models');
var contactModel = require('../models/contact_models');
var chatModel = require('../../chat/models/chat_models');
var ChatofferModel = require('../../chat/models/chat_offer_models');
var common_query = require('../../../../../utils/commonQuery');
var Response = require('../../../../../utils/response');
var constant = require('../../../../../utils/constants');

const uuidv4 = require('uuid/v4');
const randomize = require('randomatic');

const csv = require('csv-parser');
const formidable = require('formidable');
var Config = require('app/config/config').get('default');

var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: Config.AWS_KEY.ACCESS_KEY_ID, // fetched from Config file based on the environment
  secretAccessKey: Config.AWS_KEY.SECRET_ACCESS_KEY,
});
var s3 = new AWS.S3();

module.exports = {
  saveCounterHistory: saveCounterHistory,
  getCounterHistory: getCounterHistory,
  getofferfromchat: getofferfromchat,
  createbidsorask: createbidsorask,
  getAllBidAndAsks: getAllBidAndAsks,
  getAllMybidOrAsk: getAllMybidOrAsk,
  getHighestBidLowestAsk: getHighestBidLowestAsk,
  getfilterData: getfilterData,
  createRoom: createRoom,
  fetchContactList: fetchContactList,
  fetchChat: fetchChat,
  getlistingfilterData: getlistingfilterData,
  updateMyAsk: updateMyAsk,
  inactiveAllBidOrAsk: inactiveAllBidOrAsk,
  deleteAllBidOrAsk: deleteAllBidOrAsk,
  updateNotes: updateNotes,
  uploadListing: uploadListing,
  deleteListingBidOrAsk: deleteListingBidOrAsk,
  inactiveListingBidOrAsk: inactiveListingBidOrAsk,
  getUserProfilelistingfilter: getUserProfilelistingfilter,
  getListingSearch: getListingSearch,
  deleteBidOrAsk: deleteBidOrAsk,
  getUserBid: getUserBid,
  updateBidOrAsk: updateBidOrAsk,
  inactiveBidOrAsk: inactiveBidOrAsk,
  getUserFeedback: getUserFeedback,
  getHighestBidOrMinAsk: getHighestBidOrMinAsk,
  getUserData: getUserData,
  getBidAndAskId,
  searchContact,
  listOfferForChat,
  searchUserList,
  updateBidAndAsk: updateBidAndAsk,
};

async function saveCounterHistory(req, res) {
  try {
    const history = {
      counter_created_at: new Date(),
      counter_user_name: req.body.counter_user_name,
      counter_user_id: req.body.counter_user_id,
      counter_qty: req.body.counter_qty,
      counter_amount: req.body.counter_amount,
      is_responder: req.body.is_responder,
      counter_id: req.body.counter_id,
    };
    await bookshelf.knex('counter_history').insert(history);
    return res.json({
      history,
    });
  } catch (error) {
    return res.json({
      error,
    });
  }
}

async function getCounterHistory(req, res) {
  try {
    const counter_id = req.body.counter_id;
    const history = await bookshelf
      .knex('counter_history')
      .where({ counter_id })
      .orderBy('id', 'desc')
      .then((history) => history);
    return res.json({
      history,
    });
  } catch (error) {
    return res.json({
      error,
    });
  }
}

function updateBidAndAsk(req, res) {
  async function updateBidAndAsk() {
    try {
      let sql = `UPDATE counters
      SET amount = ${req.body.amount},
          expiry_day = ${req.body.expiry_day},
          note = '${req.body.note}',
          payment_method = '${req.body.payment_method}',
          payment_time = '${req.body.payment_time}',
          qty = ${req.body.qty},
          is_counter_sent = ${req.body.isCounterSent},
          is_counter_received = ${req.body.isCounterReceived}
          WHERE id = ${req.body.id}`;

      console.log(req.body);
      console.log(sql);
      bookshelf.knex
        .raw(sql)
        .then((data) => {
          console.log(data);
          return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, data.rows));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  updateBidAndAsk().then((data) => {});
}

function listOfferForChat(req, res) {
  async function async_fun() {
    try {
      if (req.body.my_own_id && req.body.userid_of_my_contact) {
        // console.log('req.body.contact_idreq.body.contact_id',req.body.contact_id)
        /**
         * find the contact id
         */
        console.log('c_conditionc_condition', req.body.my_own_id);

        const c_condition = {
          my_id: req.body.my_own_id,
          my_contact_id: req.body.userid_of_my_contact,
        };
        console.log('c_conditionc_condition', c_condition);

        let getContactId = await common_query.findAllData(contactModel, c_condition);

        console.log('getContactId', getContactId.data.toJSON());

        getContactId = getContactId.data.toJSON();
        const condition = {
          'chat_offer.contact_id': getContactId[0].id,
          // "cart.isDeleted": false
          // "cart.isCheckout": false
        };
        console.log('condition', getContactId[0].id);
        new ChatofferModel()
          .where(condition)
          .query(_filter)
          .query(_filter1)
          .query(_filter2)
          .query(function (qb) {
            qb.columns([
              'chat_offer.id as co_id',
              'chat_offer.offer_id as co_offer_id',
              'chat_offer.contact_id as co_contact_id',
              'my.first_name as my_firstname',
              'my.last_name as my_lastname',
              'my.profile_image_url as my_profile_image',
              'other.first_name as other_firstname',
              'other.last_name as other_lastname',
              'other.term_shipping',
              'other.additional_term',
              'other.shipping_address',
              'other.profile_image_url as other_profile_image',
              'products.productName',
              'images.imageUrl',
              'bid_and_ask.*',
              'counter.expiry_date as c_expiry_date',
              'counter.type_of as c_type',
              'counter.type_of_offer as c_type_of_offer',
              'counter.payment_time as c_payment_time ',
              'counter.expiry_day as c_expiry_day',
              'counter.product_id as c_product_id',
              'counter.payment_method as c_payment_method',
              'counter.qty as c_qty',
              'counter.amount as c_amount',
              'counter.total_amount as c_total_amount',
              'counter.note as c_note',
              'counter.track_no as c_track_no',
            ]);
            qb.orderBy('bid_and_ask.amount', 'ASC');
          })
          .fetchAll()
          .then(function (chatofferlist) {
            console.log('chatofferlistchatofferlist', chatofferlist.toJSON());
            return res.json(Response(constant.statusCode.ok, constant.messages.dataFetchedSuccess, chatofferlist));
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
      }
    } catch (error) {}

    function _filter(qb) {
      // qb.joinRaw(`LEFT JOIN users ON (cart."user_id" = users.id)`);
      qb.joinRaw(`LEFT JOIN contacts ON (chat_offer."contact_id" = contacts.id)`);
      qb.joinRaw(`LEFT JOIN counters as counter ON (chat_offer."offer_id" = counter.id)`);
    }
    function _filter1(qb) {
      qb.joinRaw(`LEFT JOIN bid_and_ask ON (counter."bid_and_ask_id" = bid_and_ask.id)`);
      qb.joinRaw(`LEFT JOIN users as other ON (contacts."my_contact_id" = other.id)`);
      qb.joinRaw(`LEFT JOIN users as my ON (contacts."my_id" = my.id)`);
    }
    function _filter2(qb) {
      qb.joinRaw(`LEFT JOIN products ON (bid_and_ask."productId" = products.id)`);
      qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
    }
  }
  async_fun();
}
//seller id is 22 syed
//bidder id i 107 abc

function getofferfromchat(req, res) {
  async function async_fun() {
    try {
      if (req.body.sellerid && req.body.bidderid) {
      } else {
        return res.json(Response(constant.statusCode.validation, constant.messages.invalid_data));
      }
    } catch (error) {}
  }
  async_fun();
}

function searchUserList(req, res) {
  async function async_fun() {
    try {
      if (req.body.searchName) {
        let searchChar, orderQuery;
        if (req.body.searchName) {
          searchChar = ` (U2."first_name" ilike 
        '%${req.body.searchName}%' OR U2."last_name" 
        ilike '%${req.body.searchName}%') AND U2.id != ${req.body.my_id}`;
        }
        let sql = `SELECT 
                U1.first_name as my_first_name,U1.last_name as my_last_name,U1.id as my_own_id,
                U1.company_logo as my_company_logo, U1.profile_image_url as my_profile_image, 
                U1.term_shipping,
                U1.additional_term,
                U1.shipping_address,
                U2.first_name as my_contact_first_name,
                U2.last_name as my_contact_last_name,
                U2.id as user_id_of_contact FROM users as U1 ON 
        U1.id=${req.body.my_id}
        LEFT JOIN users as U2 ON 
        U2.id!=${req.body.my_id}
WHERE ${searchChar ? searchChar : ''} order by U2.first_name, U2.last_name`;

        bookshelf.knex
          .raw(sql)
          .then((data) => {
            console.log('User list search Data: ', data.rows);
            return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data.rows));
          })
          .catch((err) => console.log('errerrerrerrerrerrerrerrerr', err));
      } else {
        return res.json(Response(constant.statusCode.validation, constant.messages.invalid_data));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  async_fun();
}

function searchContact(req, res) {
  async function async_fun() {
    try {
      const searchTexr = String(req.body.searchName);
      const searchArray = searchTexr.split(' ');
      console.log('searchArray', searchArray);
      if (req.body.searchName) {
        let searchChar, orderQuery;

        if (searchArray.length == 1) {
          searchChar = `(U2."user_name" 
        ilike '%${req.body.searchName}%') AND U2.id != ${req.body.my_id} AND U2.is_active=true `;
        } else if (searchArray.length > 1) {
          searchChar = `(U2."user_name" 
        ilike '%${searchArray[0]}%') AND U2.id != ${req.body.my_id} AND U2.is_active=true `;
        }
        let sql = `select U2.id, C.my_id, 
        C.my_id as myid, 
        C.my_contact_id as user_contact_id,
        C.room_id,
        C.offer_id,
        C.id, 
        U1.first_name as my_first_name,U1.last_name as my_last_name,U1.id as my_own_id,
                U1.company_logo as my_company_logo, U1.profile_image_url as my_profile_image, 
                U1.term_shipping,
                U1.additional_term,
                U1.shipping_address,
        U2.first_name as my_contact_first_name,
        U2.last_name as my_contact_last_name,
        U2.id as user_id_of_contact,
        U2.company_logo as my_contact_company_logo,
        U2.user_name as my_contact_user_name,
        U2.profile_image_url
        from users as U2 
        Left join users as U1 on U1.id=${req.body.my_id} AND U1.is_active=true  
        Left join (select DISTINCT ON (my_id) * from contacts) as C on U2.id=C.my_id
        left join images im on im."userId"=U2.id 
        where ${searchChar ? searchChar : ''} order by U2."first_name"`;
        //   let sql = `SELECT
        //    C.my_id as my_own_id, C.my_contact_id as user_contact_id,
        //   C.room_id,
        //   C.offer_id,
        // U1.first_name as my_contact_first_name,
        // U1.last_name as my_contact_last_name,
        // U1.id as uid,
        // Ch.my_id as c_myid, Ch.contact_id as c_contact_id, Ch.message as msg,
        // Ch.created_at as chat_date, count(*) OVER() AS contactList FROM contacts C
        // LEFT OUTER JOIN users U1 on U1.id = C."my_contact_id"
        // LEFT OUTER JOIN chats Ch on Ch.room_id = C."room_id"
        // WHERE ${searchChar ? searchChar : ''} order by chat_date DESC limit 1`

        //   let sql = `SELECT C.my_id as my_own_id, C.my_contact_id as user_contact_id,
        //   C.room_id, C.offer_id, U1.first_name as my_contact_first_name, U1.last_name as my_contact_last_name,
        // U1.id as uid, t1.my_id as c_myid, t1.contact_id as c_contact_id, t1.message as msg,
        // t1.created_at as chat_date, count(*) OVER() AS contactList  FROM chats AS t1
        //   INNER JOIN
        //   (
        //       SELECT
        //           LEAST(my_id, contact_id) AS my_id,
        //           GREATEST(my_id, contact_id) AS contact_id,
        //           MAX(id) AS max_id
        //       FROM chats
        //       GROUP BY
        //           LEAST(my_id, contact_id),
        //           GREATEST(my_id, contact_id)
        //   ) AS t2
        //       ON LEAST(t1.my_id, t1.contact_id) = t2.my_id AND
        //          GREATEST(t1.my_id, t1.contact_id) = t2.contact_id AND
        //          t1.id = t2.max_id
        //    INNER JOIN contacts as C on C.my_id = t1.my_id AND C.my_contact_id = t1.contact_id
        //    LEFT OUTER JOIN users U1 on U1.id = t1."contact_id"
        //       WHERE ${searchChar ? searchChar : ''} order by chat_date DESC`

        bookshelf.knex
          .raw(sql)
          .then((data) => {
            // console.log('datadatadatadata searchChat', data.rows);
            return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data.rows));
          })
          .catch(
            (err) => console.log('errerrerrerrerrerrerrerrerr', err)
            // res.json(Response(
            //   constant.statusCode.notFound,
            //   constant.validateMsg.noRecordFound))
          );
      } else {
        return res.json(Response(constant.statusCode.validation, constant.messages.invalid_data));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  async_fun();
}

function fetchContactList(req, res) {
  async function async_fun() {
    try {
      var result = [];
      var temp1;
      var temp2;
      if (req.body.my_id) {
        const condition = {
          'contacts.my_id': req.body.my_id,
          'contacts.isblocked': false,
        };
        // var sql = `SELECT * FROM bid_and_ask where "id"=${req.body.my_id}; `
        var sql = `SELECT contacts.my_id, contacts.my_id as myid, contacts.my_contact_id as user_contact_id,
        contacts.room_id,
        contacts.offer_id,
        contacts.id,
        t1.my_id as c_myid,
        t1.contact_id as c_contact_id,
        t1.message as msg,
        t1.created_at as chat_date,
        t1.room_id as rm_id,
        my_info.first_name as my_first_name,my_info.last_name as my_last_name,my_info.id as my_own_id,
        my_info.company_logo as my_company_logo,my_info.profile_image_url as my_profile_image, 
        my_info.term_shipping,
        my_info.additional_term,
        my_info.shipping_address,
        my_contact_info.first_name as my_contact_first_name,
        my_contact_info.last_name as my_contact_last_name,
        my_contact_info.user_name as my_contact_user_name,
        my_contact_info.company_logo as my_contact_company_logo,
        my_contact_info.profile_image_url as profile_image_url,

        my_contact_info.id as user_id_of_contact
        FROM chats AS t1
        INNER JOIN
        (
        SELECT
        LEAST(my_id, contact_id) AS my_id,
        GREATEST(my_id, contact_id) AS contact_id,
        MAX(id) AS max_id
        FROM chats
        GROUP BY
        LEAST(my_id, contact_id),
        GREATEST(my_id, contact_id)
        ) AS t2
        ON LEAST(t1.my_id, t1.contact_id) = t2.my_id AND
        GREATEST(t1.my_id, t1.contact_id) = t2.contact_id AND
        t1.id = t2.max_id
        LEFT JOIN users as my_info ON 
        (t1.my_id = my_info.id or t1.contact_id = my_info.id) AND my_info.is_active=true AND my_info.id=${req.body.my_id}
        LEFT JOIN users as my_contact_info ON 
        (t1.my_id = my_contact_info.id or t1.contact_id = my_contact_info.id) AND my_contact_info.is_active=true 
        AND my_contact_info.id!=${req.body.my_id}
        inner join contacts as contacts on (t1.my_id = contacts.my_id AND contacts.my_contact_id = t1.contact_id)
        WHERE t1.my_id = ${req.body.my_id} OR t1.contact_id = ${req.body.my_id}`;

        await bookshelf.knex
          .raw(sql)
          .then((response) => {
            // console.log('responseresponseresponse)))))))))))))0', response.rows);
            temp1 = response.rows;
            // return res.json(Response(constant.statusCode.ok, constant.messages.offerFetchedSuccessfully,
            //   response.rows));
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

        var sql1 = `
        Select C.id, C."my_id" as "my_id", C."contact_id" as "user_contact_id",  C.type, C."room_id" as "room_id", C."message" as "msg", C."updated_at" as "chat_date", 
        U.profile_image_url as my_profile_image, M.profile_image_url as contact_profile_image, U."first_name" as my_contact_first_name, U."last_name" as my_contact_last_name,
        CONCAT(M.first_name,' ',M.last_name) as "contact_name"
        from chats C
        LEFT OUTER JOIN users U ON C."contact_id" = U.id AND U.is_active=true
		    LEFT OUTER JOIN users M ON C."my_id" = M.id AND M.is_active=true 
        where C.isdelete = false and C.contact_id =${req.body.my_id} and C."type" LIKE '%email%' 
        Group By C."id", C."my_id", C."contact_id", C."room_id", U.id, U.profile_image_url,U."first_name",  C.type, U."last_name", M.profile_image_url, M.first_name, M.last_name
        order by C."id" desc
        `;
        await bookshelf.knex
          .raw(sql1)
          .then((response) => {
            // console.log('responseresponseresponse)))))))))))))0', response.rows);
            temp2 = response.rows;
            // return res.json(Response(constant.statusCode.ok, constant.messages.offerFetchedSuccessfully,
            //   response.rows));
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

        result = result.concat(temp1).concat(temp2).reverse();

        return res.json(Response(constant.statusCode.ok, constant.messages.offerFetchedSuccessfully, result));
        // new contactModel()
        //   .where(condition)
        //   .query(_filter)
        //   .query({
        //     where: { "chats.my_id": req.body.my_id },
        //     orWhere: { "chats.contact_id": req.body.my_id }
        //   })
        //   .query(function (qb) {
        //     qb.columns([
        //       "contacts.my_id as myid",
        //       "contacts.my_contact_id as user_contact_id",
        //       "my_info.first_name as my_first_name",
        //       "my_info.last_name as my_last_name",
        //       "my_info.id as my_own_id",
        //       "my_contact_info.first_name as my_contact_first_name",
        //       "my_contact_info.last_name as my_contact_last_name",
        //       "my_contact_info.id as user_id_of_contact",
        //       "my_contact_info.profile_image_url",
        //       "chats.my_id as c_myid",
        //       "chats.contact_id as c_contact_id",
        //       "chats.message as msg",
        //       "chats.created_at as chat_date"
        //     ])
        //     // qb.groupBy('contacts.id')
        //     qb.orderBy('chats.created_at', 'DESC')
        //     qb.limit(1)
        //   })
        //   .fetchAll()
        //   .then(function (contactandChatlist) {
        //     contactandChatlist = contactandChatlist.toJSON();
        //     console.log('contactandChatlist____________----------++++++++++++++', contactandChatlist);

        //     return res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, contactandChatlist));

        //   })
        //   .catch(function (err) {
        //     console.log(err)
        //     __debug(err)
        //     res.json({
        //       status: config.statusCode.error,
        //       data: [],
        //       message: i18n.__('INTERNAL_ERROR')
        //     });
        //   });
      } else {
        return res.json(Response(constant.statusCode.validation, constant.messages.invalid_data));
      }
    } catch (error) {
      console.log('errorerrorerror', error);

      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
    function _filter(qb) {
      qb.joinRaw(`LEFT JOIN users as my_info ON (contacts.my_id = my_info.id and my_info.is_active=true)`);
      qb.joinRaw(`LEFT JOIN users as my_contact_info ON (contacts.my_contact_id = my_contact_info.id and my_contact_info.is_active=true)`);

      qb.joinRaw(`LEFT JOIN chats ON (contacts."room_id" = chats.room_id)`);
    }
  }
  async_fun();
}

function fetchChat(req, res) {
  async function async_fun() {
    try {
      console.log('req.body.room_id req.body.my_id', req.body.my_id, req.body.room_id);

      if (req.body.room_id && req.body.my_id) {
        const condition = {
          // my_id: req.body.my_id,
          room_id: req.body.room_id,
          isdelete: false,
        };
        new chatModel()
          .where(condition)
          .query(_filter)
          .query(function (qb) {
            qb.columns([
              'my_info.first_name as my_first_name',
              'my_info.last_name as my_last_name',
              'my_info.user_name as my_user_name',
              'my_info.profile_image_url as profile_image_url1',
              'my_info.company_logo as company_logo1',
              'my_contact_info.first_name',
              'my_contact_info.last_name',
              'my_contact_info.profile_image_url',
              'my_contact_info.user_name',
              'my_contact_info.company_logo',

              'chats.*',
            ]);
            qb.orderBy('chats.created_at', 'ASC');
          })
          .fetchAll()
          .then(function (contactandChatlist1) {
            contactandChatlist1 = contactandChatlist1.toJSON();
            // console.log('contactandChatlist_________---------------', contactandChatlist1);

            // let gruopbydate = _.chain(contactandChatlist1)
            //   // Group the elements of Array based on `uid` property
            //   .groupBy("date_to_group")
            //   // `key` is group's name (uid), `value` is the array of objects
            //   .map((value, key) => ({ date_to_group: key, data: value }))
            //   .value()
            return res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, contactandChatlist1));
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
      } else {
        return res.json(Response(constant.statusCode.validation, constant.messages.invalid_data));
      }
    } catch (error) {
      console.log('errorerrorerrorerrorerrorerrorerrorerror', error);
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
    function _filter(qb) {
      qb.joinRaw(`LEFT JOIN users as my_info ON (chats.my_id = my_info.id)`);
      qb.joinRaw(`LEFT JOIN users as my_contact_info ON (chats.contact_id = my_contact_info.id)`);
      // qb.joinRaw(`LEFT JOIN chats ON (contacts."room_id" = chats.room_id)`);
      // qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
    }
  }
  async_fun();
}

// function fetchContactAndChatList(req, res) {
//   async function async_fun() {
//     try {
//       /**
//        * fetch data by userid and get call the contact then will that get the username
//        * and with roomid fetch the chat data with condtion of my chat and with whom chated with
//        */
//       new bidsasksModel()
//         .where(condition)
//         .query(_filter)
//         .query(function (qb) {
//           qb.columns([
//             "bid_and_ask.*",
//             "users.first_name",
//             "users.last_name",
//             "users.id as uid",
//             "users.term_shipping",
//             "users.payment_mode",
//             "users.payment_timing",
//             "users.additional_term",
//             "users.profile_image_url",
//             "products.productName",
//             "images.imageUrl"
//           ])
//           qb.orderBy('bid_and_ask.amount', 'ASC');
//         })
//         .fetchAll()
//         .then(function (getDraftListResult) {
//           getDraftListResult = getDraftListResult.toJSON();
//           return res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, getDraftListResult));

//         })
//         .catch(function (err) {
//           console.log(err)
//           __debug(err)
//           res.json({
//             status: config.statusCode.error,
//             data: [],
//             message: i18n.__('INTERNAL_ERROR')
//           });
//         });
//     } catch (error) {

//     }

//     function _filter(qb) {
//       qb.joinRaw(`LEFT JOIN users ON (bid_and_ask."createdbyId" = users.id)`);
//       qb.joinRaw(`LEFT JOIN products ON (bid_and_ask."productId" = products.id)`);
//       qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
//     }
//   } async_fun()
// }

function getBidAndAskId(req, res) {
  async function getBidAndAskId() {
    try {
      console.log(req.body);
      var sql = `SELECT b.* ,u.* 
      FROM bid_and_ask b 
      LEFT JOIN users u ON (b."createdbyId" = u.id and u.is_active=true)
      where b."id"=${req.body.bid_and_ask}; `;
      bookshelf.knex.raw(sql).then((response) => {
        return res.json(Response(constant.statusCode.ok, constant.messages.offerFetchedSuccessfully, response));
      });
    } catch (err) {
      console.log('err in getBidAndAskId');
    }
    function _filter(qb) {
      qb.joinRaw(`LEFT JOIN users ON (bid_and_ask."createdbyId" = users.id and users.is_active=true)`);
      qb.joinRaw(`LEFT JOIN products ON (bid_and_ask."productId" = products.id)`);
      qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
    }
  }
  getBidAndAskId().then((response) => {});
}

function deleteListingBidOrAsk(req, res) {
  async function deleteListingBidOrAsk() {
    try {
      if (req.body.length > 0) {
        for (var i = 0; i < req.body.length; i++) {
          if (req.body[i].checkbox) {
            var updatedata = {
              isdeleted: req.body[i].checkbox ? true : false,
            };
            let condition = {
              id: req.body[i].id,
            };
            let updateUserData = await common_query.updateRecord(bidsasksModel, updatedata, condition);
          }
        }
        return res.json(
          Response(constant.statusCode.ok, constant.messages.UpdateSuccess, {
            value: 'success',
          })
        );
      }
    } catch (err) {
      console.log('err in deleteListing', err);
    }
  }
  deleteListingBidOrAsk().then((response) => {});
}

function inactiveListingBidOrAsk(req, res) {
  async function inactiveListingBidOrAsk() {
    try {
      if (req.body.length > 0) {
        for (var i = 0; i < req.body.length; i++) {
          if (req.body[i].checkbox) {
            var updatedata = {
              isactive: req.body[i].checkbox ? true : false,
            };
            let condition = {
              id: req.body[i].id,
            };
            let updateUserData = await common_query.updateRecord(bidsasksModel, updatedata, condition);
          }
        }
        return res.json(
          Response(constant.statusCode.ok, constant.messages.UpdateSuccess, {
            value: 'success',
          })
        );
      }
    } catch (err) {
      console.log('err in inactiveListing', err);
    }
  }
  inactiveListingBidOrAsk().then((response) => {});
}

function inactiveAllBidOrAsk(req, res) {
  async function inactiveAllBidOrAsk() {
    try {
      if (req.body.length > 0) {
        for (var i = 0; i < req.body.length; i++) {
          if (req.body[i]) {
            var updatedata = {
              isactive: true,
            };
            let condition = {
              id: req.body[i],
            };
            var updateUserData = await common_query.updateRecord(bidsasksModel, updatedata, condition);
          }
        }
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
      }
    } catch (err) {
      console.log('err in inactive', err);
    }
  }
  inactiveAllBidOrAsk().then((response) => {});
}

function deleteAllBidOrAsk(req, res) {
  async function deleteAllBidOrAsk() {
    try {
      console.log('delete reqqqqqqq::::::', req.body);
      if (req.body.length > 0) {
        for (var i = 0; i < req.body.length; i++) {
          if (req.body[i]) {
            console.log('req:::::::::', req.body[i]);
            var updatedata = {
              isdeleted: true,
            };
            let condition = {
              id: req.body[i],
            };
            var updateUserData = await common_query.updateRecord(bidsasksModel, updatedata, condition);
          }
        }
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
      }
    } catch (err) {
      console.log('err in delete', err);
    }
  }
  deleteAllBidOrAsk().then((response) => {});
}
/*
Function added by VarunY
*/
function getHighestBidOrMinAsk(req, res) {
  async function asy_init() {
    if (req.body.request == 'bids') {
      var sql = `SELECT bid_and_ask.* FROM bid_and_ask where "request"=? AND "productId"=? AND "type"=? AND "isdeleted"=false AND amount IS NOT NULL ORDER BY amount DESC LIMIT 1;`;
    } else {
      var sql = `SELECT bid_and_ask.* FROM bid_and_ask where "request"=? AND "productId"=? AND "type"=? AND "isdeleted"=false AND amount IS NOT NULL ORDER BY amount ASC LIMIT 1;`;
    }
    var raw = bookshelf.knex.raw(sql, [req.body.request, req.body.productId, req.body.type]);
    raw
      .then(function (result) {
        let bid_and_ask = result.rows;
        console.log('result', result.rows);

        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, bid_and_ask));
      })
      .catch(function (err) {
        console.log('resulttttttttt errrorrrrr', err);

        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }

  asy_init();
}

function deleteBidOrAsk(req, res) {
  async function asy_init() {
    let updatedata = {
      isdeleted: true,
    };
    let condition = {
      id: req.body.id,
    };

    let updateUserData = await common_query.updateRecord(bidsasksModel, updatedata, condition);

    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.DeleteSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  asy_init();
}

function updateNotes(req, res) {
  async function asy_init() {
    let updatedata = {
      note: req.body.note,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(bidsasksModel, updatedata, condition);

    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  asy_init();
}

function updateBidOrAsk(req, res) {
  async function asy_init() {
    var qty = [];
    var minQuantity = '';
    var maxQuantity = '';

    if (req.body && req.body.minQuantity) {
      qty = req.body.minQuantity.split('-');
      minQuantity = qty[0];
      maxQuantity = qty[1];

      let updatedata = {
        type: req.body.type,
        producttype: req.body.producttype,
        minQuantity: req.body.minQuantity,
        amount: req.body.amount,
        subtype: req.body.subtype,
        note: req.body.note,
        minQuantity: minQuantity ? minQuantity : null,
        maxQuantity: maxQuantity ? maxQuantity : null,
      };
      let condition = {
        id: req.body.id,
      };

      let updateUserData = await common_query.updateRecord(bidsasksModel, updatedata, condition);

      if (updateUserData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.DeleteSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
      }
    }
  }
  asy_init();
}

function inactiveBidOrAsk(req, res) {
  async function asy_init() {
    let updatedata = {
      isactive: req.body.isactive,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(bidsasksModel, updatedata, condition);

    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.InactivateSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  asy_init();
}

function getlistingfilterData(req, res) {
  async function asy_init() {
    var sql = '';
    if (req.body.data == 'Today') {
      sql = `Select P.*, U."first_name", U."last_name", U."profile_image_url",  PR."productName", I."imageUrl"
             From bid_and_ask P
             LEFT OUTER JOIN users U on U.id = P."createdbyId"
             LEFT OUTER JOIN products PR ON P."productId" = PR.id
             LEFT OUTER JOIN images I ON P."productId" = I."productId"
              WHERE DATE(P."createdAt") >= DATE(NOW()) - INTERVAL '1 days'
              ORDER BY P.amount DESC`;
    } else if (req.body.data == 'Twoday') {
      sql = `Select P.*, U."first_name", U."last_name", U."profile_image_url", PR."productName", I."imageUrl"
      From bid_and_ask P
      LEFT OUTER JOIN users U on U.id = P."createdbyId and U.is_active=true"
      LEFT OUTER JOIN products PR ON P."productId" = PR.id
      LEFT OUTER JOIN images I ON P."productId" = I."productId"
       WHERE DATE(P."createdAt") >= DATE(NOW()) - INTERVAL '2 days'
       ORDER BY P.amount DESC`;
    } else if (req.body.data == 'Threeday') {
      sql = `Select P.*, U."first_name", U."last_name", U."profile_image_url", PR."productName", I."imageUrl"
      From bid_and_ask P
      LEFT OUTER JOIN users U on U.id = P."createdbyId"
      LEFT OUTER JOIN products PR ON P."productId" = PR.id
      LEFT OUTER JOIN images I ON P."productId" = I."productId"
       WHERE DATE(P."createdAt") >= DATE(NOW()) - INTERVAL '3 days'
       ORDER BY P.amount DESC`;
    }
    var raw2 = bookshelf.knex.raw(sql, []);
    raw2
      .then(function (result) {
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, result));
      })
      .catch(function (err) {
        console.log(err);
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }

  asy_init();
}

function getUserProfilelistingfilter(req, res) {
  async function asy_init() {
    var sql = '';
    if (req.body.data == 'Date') {
      sql = `Select B.*, U."first_name", U."last_name",  P."productName", I."imageUrl"
      From bid_and_ask B
      LEFT OUTER JOIN users U on B."createdbyId" = U.id
      LEFT OUTER JOIN products P ON B."productId" = P.id
      LEFT OUTER JOIN images I ON B."productId" = I."productId"
      where B.isdeleted = false
      GROUP BY B.id, U."first_name", U."last_name",  P."productName", I."imageUrl"
      ORDER BY B."createdAt" DESC`;
    } else if (req.body.data == 'Name') {
      sql = `Select B.*, U."first_name", U."last_name",  P."productName", I."imageUrl"
      From bid_and_ask B
      LEFT OUTER JOIN users U on B."createdbyId" = U.id
      LEFT OUTER JOIN products P ON B."productId" = P.id
      LEFT OUTER JOIN images I ON B."productId" = I."productId"
      where B.isdeleted= false
      GROUP BY B.id, U."first_name", U."last_name",  P."productName", I."imageUrl"
      ORDER BY P."productName" ASC`;
    }
    var raw2 = bookshelf.knex.raw(sql, []);
    raw2
      .then(function (result) {
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, result));
      })
      .catch(function (err) {
        console.log(err);
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }

  asy_init();
}

function getfilterData(req, res) {
  async function getfilterdataMethod() {
    if (
      (req.body.type != undefined || req.body.type != '' || req.body.type != null) &&
      (req.body.producttype != undefined || req.body.producttype != '' || req.body.producttype != null)
    ) {
      var condition = {
        request: req.body.request,
        'bid_and_ask.productId': req.body.productid,
        type: req.body.type,
        producttype: req.body.producttype,
      };
    }
    if (
      (req.body.type === undefined || req.body.type === '' || req.body.type === null) &&
      (req.body.producttype != undefined || req.body.producttype != '' || req.body.producttype != null)
    ) {
      var condition = {
        request: req.body.request,
        'bid_and_ask.productId': req.body.productid,
        producttype: req.body.producttype,
      };
    }
    if (
      (req.body.type != undefined || req.body.type != '' || req.body.type != null) &&
      (req.body.producttype === undefined || req.body.producttype === '' || req.body.producttype === null)
    ) {
      var condition = {
        request: req.body.request,
        'bid_and_ask.productId': req.body.productid,
        type: req.body.type,
      };
    }
    if (
      (req.body.type === undefined || req.body.type === '' || req.body.type === null) &&
      (req.body.producttype === undefined || req.body.producttype === '' || req.body.producttype === null)
    ) {
      var condition = {
        request: req.body.request,
        'bid_and_ask.productId': req.body.productid,
      };
    }
    if (
      (req.body.type === undefined || req.body.type === '' || req.body.type === null) &&
      (req.body.producttype === undefined || req.body.producttype === '' || req.body.producttype === null) &&
      (req.body.productId === undefined || req.body.productId === '' || req.body.productId === null)
    ) {
      var condition = {
        request: req.body.request,
      };
    }
    condition['bid_and_ask.isdeleted'] = false;
    // condition["bid_and_ask.isaddtocart"] = false;
    // console.log('conditioncondition',condition)
    condition['users.is_active'] = true;
    condition['bid_and_ask.isactive'] = false;
    condition['isPrivate'] = false;

    if (req.body && req.body.request == 'asks') {
      new bidsasksModel()
        .where(condition)
        .query(_filter)
        .query(function (qb) {
          qb.columns([
            'bid_and_ask.*',
            'users.first_name',
            'users.last_name',
            'users.user_name',
            'users.id as uid',
            'users.term_shipping',
            'users.payment_mode',
            'users.payment_timing',
            'users.company_logo',
            'users.additional_term',
            'users.profile_image_url',
            'products.productName',
            'products.categoryId',
            'products.subcategoryId',
            'products.releaseDate',
            'images.imageUrl',
          ]);
          qb.orderBy('bid_and_ask.amount', 'ASC');
        })
        .fetchAll()
        .then(function (getDraftListResult) {
          getDraftListResult = getDraftListResult.toJSON();
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
        qb.joinRaw(`LEFT JOIN users ON (bid_and_ask."createdbyId" = users.id)`);
        qb.joinRaw(`LEFT JOIN products ON (bid_and_ask."productId" = products.id)`);
        qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
      }
    } else {
      new bidsasksModel()
        .where(condition)
        .query(_filter)
        .query(function (qb) {
          qb.columns([
            'bid_and_ask.*',
            'users.first_name',
            'users.last_name',
            'users.user_name',
            'users.id as uid',
            'users.company_logo',
            'users.term_shipping',
            'users.payment_mode',
            'users.payment_timing',
            'users.additional_term',
            'products.productName',
            'users.profile_image_url',
            'products.categoryId',
            'products.subcategoryId',
            'products.releaseDate',
            'images.imageUrl',
          ]);
          qb.orderBy('bid_and_ask.amount', 'desc');
        })
        .fetchAll()
        .then(function (getDraftListResult) {
          getDraftListResult = getDraftListResult.toJSON();
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
        qb.joinRaw(`LEFT JOIN users ON (bid_and_ask."createdbyId" = users.id)`);
        qb.joinRaw(`LEFT JOIN products ON (bid_and_ask."productId" = products.id)`);
        qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
      }
    }
  }
  getfilterdataMethod().then((data) => {});
}

function uploadListing(req, res) {
  async function uploadListingMethod() {
    try {
      console.log('Varun--->');
      if (req.files) {
        let timeStamp = JSON.stringify(Date.now());
        extension = req.files.csvfile.name.split('.');
        let csvOriginalName = req.files.csvfile.name;
        db_path = timeStamp + '_' + csvOriginalName;

        let result_s3 = await s3file_upload.uploadBulkUploadImage(req.files.csvfile.data, db_path);

        let streamData;
        let arrStreamData = [];
        let extensionArray = ['csv'];
        let format = extension[extension.length - 1];
        if (extensionArray.includes(format)) {
          if (result_s3.url) {
            let countData = 0;
            let params = {
              Bucket: result_s3.bucket,
              Key: result_s3.key,
            };

            s3.getObject(params)
              .createReadStream(result_s3.url)
              .pipe(csv())
              .on('data', async (data) => {
                // let d1= JSON.parse(data);

                // console.log('data1178',data)

                countData++;
                streamData = data;

                arrStreamData.push(streamData);
                if (data && (data.subtype == 'null' || !data.subtype)) {
                  data.subtype = 0;
                }

                var createdAt = `${moment().utc().format('YYYY-MM-DD')}`;
                let boln = data.rowAddedorUpdated.toLowerCase();
                console.log('boolan', boln);

                if (boln == 'true') {
                  console.log('inside if');
                  let savedata = {
                    request: data.request ? data.request : null,
                    productId: data.product_id ? data.product_id : null,
                    minQuantity: data.min ? data.min : null,
                    maxQuantity: data.max ? data.max : null,
                    producttype: data.producttype ? data.producttype : null,
                    amount: data.amount ? data.amount : null,
                    type: data.type ? data.type : null,
                    subtype: data.subtype ? data.subtype : null,
                    createdbyId: req.body.id,
                    createdAt: createdAt ? createdAt : null,
                    isdeleted: false,
                    isactive: false,
                    isaddtocart: false,
                  };

                  try {
                    const condit = {
                      id: data.id,
                      createdbyId: req.body.id,
                    };
                    console.log('cnditionnnn 1213', condit);
                    let findProduct = await common_query.findAllData(bidsasksModel, condit, savedata).catch((err) => {
                      throw err;
                    });
                    console.log('findProduct', findProduct.data.toJSON());
                    if (findProduct.data.toJSON().length) {
                      console.log('inside findproduct');
                      let updateData = await common_query.updateRecord(bidsasksModel, savedata, condit);
                    } else {
                      console.log('save Data', savedata);
                      let savesuccess = await common_query.saveRecord(bidsasksModel, savedata);
                      if (savesuccess.code == 200) {
                        // return res.json(Response(constant.statusCode.ok, "uploaded successfully", {}));
                      }
                    }
                  } catch (err) {
                    // return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, err))
                  }
                }
              })
              .on('end', () => {
                console.log(result_s3.url, 'end on call');
              })
              .on('finish', async () => {
                // if (arrStreamData.length > 0) {
                //   arrStreamData.forEach(async (element) => {
                //     if (element && (element.subtype == 'null' || !element.subtype)) {
                //       element.subtype = 0;
                //     }
                //     var createdAt = `${moment().utc().format('YYYY-MM-DD')}`;
                //     let savedata = {
                //       request: element.request ? element.request : null,
                //       productId: element.product_id ? element.product_id : null,
                //       minQuantity: element.min ? element.min : null,
                //       maxQuantity: element.max ? element.max : null,
                //       producttype: element.producttype ? element.producttype : null,
                //       amount: element.amount ? element.amount : null,
                //       type: element.type ? element.type : null,
                //       subtype: element.subtype ? element.subtype : null,
                //       createdbyId: req.body.id,
                //       note: element.note ? element.note : null,
                //       createdAt: createdAt ? createdAt : null,
                //       isdeleted: false,
                //       isactive: false,
                //       isaddtocart: false
                //     }
                //     let saveRecord = await common_query.saveRecord(bidsasksModel, savedata);
                //   });

                //   return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, { value: 'success' }))
                // }
                return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, { value: 'success' }));
              })
              .on('close', () => {
                console.log('rstream close');
              });
          } else {
            return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.updateError));
          }
        } else {
          return res.json(Response(constant.statusCode.alreadyExist, 'Invalid format'));
        }
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  uploadListingMethod().then((data1) => {});
}

function getUserBid(req, res) {
  async function getUserBidMethod() {
    try {
      var sql = `
      select B.*, U."first_name", U."last_name",  P."productName", I."imageUrl", P.id as "product_id", C."categoryName", S."subcategory_name"
      from bid_and_ask B 
      LEFT OUTER JOIN users U on B."createdbyId" = U.id
      LEFT OUTER JOIN products P ON B."productId" = P.id
      LEFT OUTER JOIN images I ON P.id = I."productId"
      LEFT OUTER JOIN category C ON P."categoryId" = c.id
	    LEFT OUTER JOIN subcategory S ON P."subcategoryId" = S.id
      WHERE B."createdbyId" = ? and B.isdeleted = false and B.isactive=false and P.isdeleted=false
      GROUP BY B.id, U."first_name", U."last_name",  P."productName", I."imageUrl", P.id, C."categoryName", S."subcategory_name"
      ORDER BY B."amount" ASC
      `;
      var raw2 = bookshelf.knex.raw(sql, [req.body.id]);
      raw2.then(function (result) {
        if (result) {
          return res.json(Response(constant.statusCode.ok, constant.messages.userData, result));
        }
      });
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  getUserBidMethod().then((data) => {});
}

function getUserFeedback(req, res) {
  async function getUserFeedbackMethod() {
    try {
      let result = {
        lifetime: [],
        threemonths: [],
        sixmonths: [],
      };

      var sql = `
      select F."created_at", F."feedback_by_seller" as "sellerFeedback", F."feedback_by_bidder" as "bidderFeedback"
      from feedbacks F
      LEFT OUTER JOIN counters C ON C.id = F."counters_id"
      LEFT OUTER JOIN orders O ON O."counter_id" = C.id
      where O.is_deleted = false and O."status" LIKE '%accept%' and O."track_no" is not NULL 
      and (C."seller_id"=${req.body.userId} OR C."bidder_id"=${req.body.userId}) 
      and F."isdeleted" = false 
      group by F."created_at", F."feedback_by_seller", F."feedback_by_bidder"
      order by F."created_at" desc
      `;
      await bookshelf.knex
        .raw(sql)
        .then((data) => {
          result.lifetime.push(data.rows);
        })
        .catch((err) => {
          console.log('err');
        });

      var sql1 = `
        select F."created_at", F."feedback_by_seller" as "sellerFeedback", F."feedback_by_bidder" as "bidderFeedback"
        from feedbacks F
        LEFT OUTER JOIN counters C ON C.id = F."counters_id"
        LEFT OUTER JOIN orders O ON O."counter_id" = C.id
        where O.is_deleted = false and O."status" LIKE '%accept%' and O."track_no" is not NULL 
        and (C."seller_id"=${req.body.userId} OR C."bidder_id"=${req.body.userId}) 
        and F."isdeleted" = false and DATE(F."created_at") >= DATE(NOW()) - INTERVAL '90 days'
        group by F."created_at", F."feedback_by_seller", F."feedback_by_bidder"
        order by F."created_at" desc
        `;
      await bookshelf.knex
        .raw(sql1)
        .then((data) => {
          result.threemonths.push(data.rows);
        })
        .catch((err) => {
          console.log('err');
        });

      var sql2 = `
      select F."created_at", F."feedback_by_seller" as "sellerFeedback", F."feedback_by_bidder" as "bidderFeedback"
      from feedbacks F
      LEFT OUTER JOIN counters C ON C.id = F."counters_id"
      LEFT OUTER JOIN orders O ON O."counter_id" = C.id
      where O.is_deleted = false and O."status" LIKE '%accept%' and O."track_no" is not NULL 
      and (C."seller_id"=${req.body.userId} OR C."bidder_id"=${req.body.userId}) 
      and F."isdeleted" = false and DATE(F."created_at") >= DATE(NOW()) - INTERVAL '180 days'
      group by F."created_at", F."feedback_by_seller", F."feedback_by_bidder"
      order by F."created_at" desc
      `;
      await bookshelf.knex
        .raw(sql2)
        .then((data) => {
          result.sixmonths.push(data.rows);
        })
        .catch((err) => {
          console.log('err');
        });
      return res.json(Response(constant.statusCode.ok, constant.messages.userFeedback, result));
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  getUserFeedbackMethod().then((data) => {});
}

function getUserData(req, res) {
  async function getUserdataMethod() {
    let condition = {};
    if (req.body.type == 'Box' || req.body.type == 'Case') {
      condition = {
        createdbyId: req.body.createdbyId,
        request: req.body.request,
        'bid_and_ask.productId': req.body.productId,
        type: req.body.type,
      };
    } else if (req.body && req.body.productId) {
      condition = {
        createdbyId: req.body.createdbyId,
        request: req.body.request,
        'bid_and_ask.productId': req.body.productId,
      };
    } else {
      condition = {
        createdbyId: req.body.createdbyId,
        request: req.body.request,
      };
    }
    if (req.body && req.body.producttype) {
      condition.producttype = req.body.producttype;
    }
    condition['bid_and_ask.isdeleted'] = false;
    if (req.body.request == 'asks') {
      new bidsasksModel()
        .where(condition)
        .query(_filter)
        .query(function (qb) {
          qb.columns([
            'bid_and_ask.*',
            'users.first_name',
            'users.last_name',
            'users.user_name',
            'users.id as uid',
            'users.company_logo',
            'users.profile_image_url',
            'products.productName',
            'products.releaseDate',
            'images.imageUrl',
          ]);
          qb.orderBy('bid_and_ask.amount', 'ASC');
        })
        .fetchAll()
        .then(function (getDraftListResult) {
          getDraftListResult = getDraftListResult.toJSON();
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
        qb.joinRaw(`LEFT JOIN users ON (bid_and_ask."createdbyId" = users.id)`);
        qb.joinRaw(`LEFT JOIN products ON (bid_and_ask."productId" = products.id)`);
        qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
      }
    } else {
      new bidsasksModel()
        .where(condition)
        .query(_filter)
        .query(function (qb) {
          qb.columns([
            'bid_and_ask.*',
            'users.first_name',
            'users.last_name',
            'users.user_name',
            'users.id as uid',
            'users.company_logo',
            'users.profile_image_url',
            'products.productName',
            'products.releaseDate',
            'images.imageUrl',
          ]);
          qb.orderBy('bid_and_ask.amount', 'DESC');
        })
        .fetchAll()
        .then(function (getDraftListResult) {
          getDraftListResult = getDraftListResult.toJSON();
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
        qb.joinRaw(`LEFT JOIN users ON (bid_and_ask."createdbyId" = users.id)`);
        qb.joinRaw(`LEFT JOIN products ON (bid_and_ask."productId" = products.id)`);
        qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
      }
    }
  }
  getUserdataMethod().then((data) => {});
}

function createbidsorask(req, res) {
  async function createbidsoraskMethod() {
    try {
      let { request, productId, minQuantity, producttype, amount, type, subtype, note, isPrivate } = req.body;
      var qty = [];
      let maxQuantity;
      if (req.body && req.body.minQuantity) {
        qty = req.body.minQuantity.split('-');
        minQuantity = qty[0];
        maxQuantity = qty[1];
      }
      console.log('bodyreq', minQuantity, 'maxQuantity', maxQuantity);
      const transaction_number = randomize('Aa0', 6);
      // req.body.minQuantity.split('-')
      var createdAt = `${moment().utc().format('YYYY-MM-DD')}`;
      let data = {
        request: request ? request : null,
        productId: productId ? productId : null,
        minQuantity: minQuantity ? minQuantity : null,
        maxQuantity: maxQuantity ? maxQuantity : null,
        producttype: producttype ? producttype : null,
        amount: amount ? amount : null,
        type: type ? type : null,
        subtype: subtype ? subtype : null,
        note: note ? note : null,
        createdbyId: req.user._id,
        createdAt: createdAt ? createdAt : null,
        isdeleted: false,
        isactive: false,
        isaddtocart: false,
        isPrivate: isPrivate ? isPrivate : false,
      };

      var msg;
      if (req.body.request == 'bids') {
        msg = constant.messages.BidCreated;
      } else {
        msg = constant.messages.AskCreated;
      }

      let createBidData = await common_query.saveRecord(bidsasksModel, data);
      if (createBidData.code == 200) {
        return res.json(Response(constant.statusCode.ok, msg, createBidData));
      } else if (createBidData.code == 409) {
        console.log('saveUserData===>in else');

        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  createbidsoraskMethod().then((data) => {});
}
function updateMyAsk(req, res) {
  async function updateMyAskMethod() {
    try {
      let toUpdate;
      if (req.body.length) {
        for (let i in req.body) {
          if (req.body.length == 1) {
            if (req.body[i].amount && req.body[i].minQuantity) {
              toUpdate = `(${req.body[i].id},${req.body[i].amount},${req.body[i].minQuantity},
                ${req.body[i].maxQuantity})`;
            }
          } else {
            if (req.body.length > 1 && i != 0) {
              if (req.body[i].amount && req.body[i].minQuantity) {
                toUpdate = toUpdate.concat(`,(${req.body[i].id},${req.body[i].amount},${req.body[i].minQuantity}, ${req.body[i].maxQuantity})`);
              }
            }
          }
        }
        let sql = `update bid_and_ask as t1 set "amount" = t2.amount, "minQuantity" = t2.minQuantity, "maxQuantity" = t2.maxQuantity from (values ${toUpdate}) as t2(id, amount, minQuantity, maxQuantity) where t2.id = t1.id;`;
        let responseData = await bookshelf.knex.raw(sql);
        if (responseData.rowCount > 0) {
          return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, responseData));
        }
      }
    } catch (err) {
      console.log('@error in updatemytasks', err);
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  updateMyAskMethod();
}
// function updateMyAsk(req, res) {
//   async function updateMyAskMethod() {
//     try {
//       let toUpdate = '';
//       if (req.body.length) {
//         for (let i in req.body) {
//           if (req.body.length==1) {
//             if (req.body[i].amount && req.body[i].minQuantity) {
//               console.log('toUpdate::::ifff:', toUpdate)
//               toUpdate = `(${req.body[i].id},${req.body[i].amount},${req.body[i].minQuantity},
//                 ${req.body[i].maxQuantity})`;
//             }
//           }else{
//             if (req.body.length > 1 && i != 0) {
//               if (req.body[i].amount && req.body[i].minQuantity) {
//                 console.log('toUpdate::::else:', toUpdate)
//               toUpdate = toUpdate.concat(`,(${req.body[i].id},${req.body[i].amount},${req.body[i].minQuantity}, ${req.body[i].maxQuantity})`);
//             }
//           }
//           }

//         }
//         let sql = `update bid_and_ask as t1 set "amount" = t2.amount, "minQuantity" = t2.minQuantity, "maxQuantity" = t2.maxQuantity from (values ${toUpdate}) as t2(id, amount, minQuantity, maxQuantity) where t2.id = t1.id;`
//         let responseData = await bookshelf.knex.raw(sql);
//         if (responseData.rowCount > 0) {
//           return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, responseData));
//         }
//       }
//     }
//     catch (err) {
//       console.log("@error in updatemytasks", err)
//       return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError))
//     }
//   }

//   updateMyAskMethod().then((data) => {

//   })
// }

// function updateMyAsk
//   (req, res) {
//   async function updateMyAskMethod() {
//     console.log(req.bodegistey);

//     if(req.body.length && req.body.length>0){
//       let statusArray = [];
//       req.body.forEach(eachData=>{

//         console.log("eachdta");
//         let condition = {
//           id: eachData.id
//         }
//         let updatedata = {
//           minQuantity: eachData.minQuantity ? eachData.minQuantity : null,
//           amount: eachData.amount ? eachData.amount : null,

//         }
//           common_query.updateRecord(bidsasksModel, updatedata, condition).then(response=>{
//             if(response.code==200){
//               statusArray.push(true);
//               if(statusArray.length==1){
//                 return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, response));
//               }
//             }
//           }
//             )
//             .catch(err=>{
//               return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
//             })
//       })
//     }
//     else {

//       let updatedata = {
//         minQuantity: req.body.minQuantity ? req.body.minQuantity : null,
//         amount: req.body.amount ? req.body.amount : null,

//       }

//       let condition = {
//         id: req.body.id
//       }
//       try {
//         let updateUserData = await common_query.updateRecord(bidsasksModel, updatedata, condition);
//         if (updateUserData.code == 200) {
//           return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
//         } else {
//           return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
//         }
//       }
//       catch (error) {
//         return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body))
//       }

//     }

//   }

//   updateMyAskMethod().then((data) => {

//   })
// }

function updateMyAsk(req, res) {
  async function updateMyAskMethod() {
    try {
      let toUpdate;
      if (req.body.length > 0) {
        for (let i in req.body) {
          if (i == 0) {
            toUpdate = `(${req.body[i].id},${req.body[i].amount},${req.body[i].minQuantity},${req.body[i].maxQuantity})`;
          }
          if (req.body.length > 1 && i != 0) {
            toUpdate = toUpdate.concat(`,(${req.body[i].id},${req.body[i].amount},${req.body[i].minQuantity}, ${req.body[i].maxQuantity})`);
          }
        }
        let sql = `update bid_and_ask as t1 set "amount" = t2.amount, "minQuantity" = t2.minQuantity, "maxQuantity" = t2.maxQuantity from (values ${toUpdate}) as t2(id, amount, minQuantity, maxQuantity) where t2.id = t1.id;`;
        let responseData = await bookshelf.knex.raw(sql);
        if (responseData.rowCount > 0) {
          return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, responseData));
        }
      }
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }

  updateMyAskMethod().then((data) => {});
}
function getHighestBidLowestAsk(req, res) {
  async function getHighestBidLowestAskMethod() {
    console.log('sdfsdfsdfsdfsdfsdfsdfsdfsdfs', req.body);
    var sql = `SELECT products.*, images."imageUrl" FROM 
    products LEFT JOIN images ON 
    products.id=images."productId" WHERE ("category_id"=? AND (SELECT EXTRACT(YEAR FROM "releaseDate")=?));`;
    var raw = bookshelf.knex.raw(sql, [req.body.category_id, req.body.releaseDate]);
    raw.then(function (result) {});
  }
  getHighestBidLowestAskMethod().then(function (params) {});
}

// function getAllBidAndAsks(req, res) {
//   async function getAllBidAndAsksMethod() {
//     let condition = {
//       request: req.body.request,
//       productId:req.body.productid
//     }
//     let allBidAndAsksData = await common_query.findAllData(bidsasksModel, condition);
//     if(allBidAndAsksData.code == 200){
//       return res.json(Response(constant.statusCode.ok, constant.messages.allbidsandasksFetchedSuccessfully, allBidAndAsksData));
//   }else{
//       return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
//   }
// }
//   getAllBidAndAsksMethod().then((data) => {
//   })
// }

function getHighestBidAndLowestAsk(req, res) {
  async function getAllproductByYearsMethod() {
    console.log(req.body);

    var sql = `SELECT products.*, images."imageUrl" FROM products LEFT JOIN images ON products.id=images."productId" WHERE ("category_id"=? AND (SELECT EXTRACT(YEAR FROM "releaseDate")=?));`;
    var raw = bookshelf.knex.raw(sql, [req.body.category_id, req.body.releaseDate]);
    raw
      .then(function (result) {
        let array1 = result.rows;
        console.log(result.rows);
        var products = [];
        array1.forEach((element) => {
          let output = JSON.stringify(element);
          let output1 = JSON.parse(output);
          products.push(output1);
        });
        console.log('res', products);
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, products));
      })
      .catch(function (err) {
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getAllproductByYearsMethod().then(function (params) {});
}

function getAllMybidOrAsk(req, res) {
  async function getAllMybidOrAskMethod() {
    var conditions = {
      'bid_and_ask.createdbyid': 34,
      'bid_and_ask.request': 'bids',
    };

    new bidsasksModel()
      .where(conditions)
      .query(_filter)
      .query(function (qb) {
        qb.columns(['bid_and_ask.*', 'products.productName', 'images.imageUrl']);
        //  qb.select(bookshelf

        // .knex.raw(`(SELECT EXTRACT(MONTH FROM 'createdAt')=?)`),[3])
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
      qb.joinRaw(`LEFT JOIN products ON (bid_and_ask."productId" = products."id")`);
      qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
    }
  }
  getAllMybidOrAskMethod().then((data) => {});
}

function getListingSearch(req, res) {
  async function getListingSearchMethod() {
    var sql = `
        Select B.*, U."first_name", U."last_name",  P."productName", I."imageUrl"
        From bid_and_ask B
        LEFT OUTER JOIN users U on B."createdbyId" = U.id
        LEFT OUTER JOIN products P ON B."productId" = P.id
        LEFT OUTER JOIN images I ON P.id = I."productId"
        WHERE (P."productName" iLIKE '%'||?||'%')
        GROUP BY B.id, U."first_name", U."last_name",  P."productName", I."imageUrl"
        ORDER BY p."productName" ASC`;

    var raw2 = bookshelf.knex.raw(sql, [req.body.search]);
    raw2
      .then(function (result) {
        if (result) {
          return res.json(Response(constant.statusCode.ok, constant.messages.searchresultsuccess, result));
        }
      })
      .catch(function (err) {
        console.log(err);
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getListingSearchMethod().then(function (params) {});
}

function getAllBidAndAsks(req, res) {
  async function getAllBidAndAsksMethod() {
    console.log('values:', req.body.request);
    let condition = {
      request: req.body.request,
      productId: req.body.productid,
    };

    new bidsasksModel()
      .where(condition)
      .query(_filter)
      .query(function (qb) {
        qb.columns([
          'bid_and_ask.*',
          'users.first_name',
          'users.last_name',
          //  "images.imageUrl"
        ]);
        //  qb.select(bookshelf

        // .knex.raw(`(SELECT EXTRACT(MONTH FROM 'createdAt')=?)`),[3])
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
      qb.joinRaw(`LEFT JOIN users ON (bid_and_ask."createdbyId" = users.id)`);
      //          qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."createdbyId" = images."userId")`);
    }
  }
  getAllBidAndAsksMethod().then((data) => {});
}

function createRoom(req, res) {
  console.log('reqqqq', req.body);
  async function createRoom() {
    try {
      if (req.body.user_id && req.body.contact_id) {
        let data = {
          user_id1: req.body.user_id,
          user_id2: req.body.contact_id,
          status: true,
          created_at: `${moment().utc().format('YYYY-MM-DD')}`,
          updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
        };

        // const room_user = await common_query.findAllData(roomModel, rm_condition).catch(err => {
        //   throw err
        // })
        let inRoom = await bookshelf.knex.raw(`select 
         "id" from rooms where ("user_id1"= '${req.body.user_id}' and "user_id2"= '${req.body.contact_id}') or
         ("user_id2"= '${req.body.user_id}' and "user_id1"= '${req.body.contact_id}');`);
        console.log('offer_idoffer_id', req.body.offer_id);
        if (inRoom.rowCount) {
          console.log('2');
          let rmCondition = {
            id: inRoom.rows[0].id,
          };

          console.log('5');

          const update_rm = {
            status: true,
            updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
          };
          await common_query.updateRecord(roomModel, update_rm, rmCondition).catch((err) => {
            throw err;
          });

          const update_offer_userid = {
            room_id: inRoom.rows[0].id,
            my_id: req.body.user_id,
            my_contact_id: req.body.contact_id,
          };
          const toUpdateoffer = {
            offer_id: req.body.offer_id,
          };
          const dataOrder = await common_query.updateRecord(contactModel, toUpdateoffer, update_offer_userid).catch((err) => {
            throw err;
          });
          console.log('dataOrderdataOrderdataOrderdataOrder', dataOrder);
          const update_offer_contact_id = {
            room_id: inRoom.rows[0].id,
            my_contact_id: req.body.user_id,
            my_id: req.body.contact_id,
          };
          await common_query.updateRecord(contactModel, toUpdateoffer, update_offer_contact_id).catch((err) => {
            throw err;
          });
          const responseD = {
            roomid: inRoom.rows[0].id,
          };

          return res.json(Response(constant.statusCode.ok, constant.messages.Registration, responseD));
        } else {
          console.log('datadatadatadata', data);
          let saveRoom = await common_query.saveRecord(roomModel, data).catch((err) => {
            throw err;
          });
          console.log('saveRoomsaveRoom', saveRoom.success.toJSON());
          let resp = saveRoom.success.toJSON();
          if (saveRoom) {
            let data = {
              my_id: req.body.user_id,
              my_contact_id: req.body.contact_id,
              isblocked: false,
              created_at: `${moment().utc().format('YYYY-MM-DD')}`,
              updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
              room_id: resp.id,
              offer_id: req.body.offer_id,
            };
            await common_query.saveRecord(contactModel, data).catch((err) => {
              throw err;
            });
            let data1 = {
              my_contact_id: req.body.user_id,
              my_id: req.body.contact_id,
              isblocked: false,
              created_at: `${moment().utc().format('YYYY-MM-DD')}`,
              updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
              room_id: resp.id,
              offer_id: req.body.offer_id,
            };
            await common_query.saveRecord(contactModel, data1).catch((err) => {
              throw err;
            });

            const responseData = {
              roomid: resp.id,
            };
            return res.json(Response(constant.statusCode.ok, constant.messages.Registration, responseData));
          } else {
            return res.json(Response(constant.statusCode.internalError, constant.messages.commonError, null));
          }
        }
      } else {
        return res.json(Response(constant.statusCode.validation, constant.messages.invalid_data));
      }
    } catch (err) {
      console.log('err in creating Room');
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  createRoom().then(function () {});
}

/**
 * Function in use to get the contact data
 * and room data
 */

// function getRoomData(req, res) {
//   async function async_fun() {
//     try {

//       let inRoom = await bookshelf.knex.raw(`select
//       "id" from rooms where ("user_id"= '${req.body.user_id}' and "contact_id"= '${req.body.contact_id}') or
//       ("contact_id"= '${req.body.user_id}' and "user_id"= '${req.body.contact_id}');`);
//       console.log('1', inRoom)

//     } catch (error) {

//     }
//   } async_fun()
// }
