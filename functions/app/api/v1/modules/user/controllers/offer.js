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
module.exports = {
  getAcceptOfferByUserId,
  getRecievedOffers,
  getSentOffers,
  getClosedOfferByUserId,
  getCounters,
  getUsers,
  getChatOfferList,
};

function getAcceptOfferByUserIds(req, res) {
  async function getAcceptOfferByUserIds() {
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
          sqlbid = `select c.*,
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
          sqlask = `select c.*,
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

      console.log('searchArray no search ***************************');
      let result1 = {
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
          sqlbid = `select c.*,
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
        where c."created_at"='${create}' and c."seller_id"=${eachobj.seller_id}
        and c."expiry_day"=${eachobj.expiry_day}
      
        and c."product_id"=${eachobj.product_id} and c.bidder_id=${eachobj.bidder_id}
        and c.is_deleted='false'
        and c."status" = 'accept'
        and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlbid)
            .then((data) => {
              // console.log('data in buy query----->', data.rows)
              result1.buying.push(data);
            })
            .catch((err) => {
              console.log('err in buy query', err);
            });
        }
      }
      if (groupbySelling[0].length > 0) {
        for (let eachobj of groupbySelling[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlask = `select c.*,
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
        where c."created_at"='${create}' and
        c."bidder_id"=${eachobj.bidder_id} and c."expiry_day"=${eachobj.expiry_day}
        and c."product_id"=${eachobj.product_id}
        and c."status" = 'accept'
        and c.seller_id=${eachobj.seller_id} and c.is_deleted='false'
        and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlask)
            .then((data) => {
              // console.log('data in sell query----->', data.rows)
              result1.selling.push(data);
            })
            .catch((err) => {
              console.log('err in sell query', err);
            });
        }
      }
      var sell = result1.selling;
      var buy = result1.buying;
      // var temp = []
      // var temp1 = [];
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

      let result2 = {};

      sqlbid = `select c.*,
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
            where (c."bidder_id"=${req.body.loggedUser})
            and (c.expiry_date > now() AT TIME ZONE 'UTC' and c.is_deleted=false and c.type_of_offer='Counter' and c.type_of='bid' );`;
      await bookshelf.knex
        .raw(sqlbid)
        .then((data) => {
          result2.counterBid = data;
        })
        .catch((err) => {
          console.log('err');
        });

      sqlask = `select c.*,
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
            where (c."seller_id"=${req.body.loggedUser})
            and (c.expiry_date > now() AT TIME ZONE 'UTC' and c.is_deleted=false and c.type_of_offer='Counter' and c.type_of='ask' );`;
      await bookshelf.knex
        .raw(sqlask)
        .then((data) => {
          result2.counterAsk = data;
        })
        .catch((err) => {
          console.log('err');
        });

      var sell1 = result2.counterAsk;
      var buy1 = result2.counterBid;
      for (var i = 0; i < sell1.length; i++) {
        for (var j = 0; j < sell1[i].rows.length; j++) {
          temp.push(sell1[i].rows[j]);
        }
      }
      for (var i = 0; i < buy1.length; i++) {
        for (var j = 0; j < buy1[i].rows.length; j++) {
          temp1.push(buy1[i].rows[j]);
        }
      }

      let result4 = {
        acceptAsk: [],
        acceptBid: [],
      };
      let groupbyAsk1 = [];
      let groupbyBid2 = [];
      let groupbyAsksql1 = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id
  from counters where bidder_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
  and type_of='ask' and expiry_date > now() AT TIME ZONE 'UTC'
  group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id ;`;
      await bookshelf.knex.raw(groupbyAsksql1).then((data) => {
        groupbyAsk1.push(data.rows);
      });
      let groupbyBidsql2 = `select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id
  from counters where seller_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
  and type_of='bid' and expiry_date > now() AT TIME ZONE 'UTC'
  group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id ;`;
      await bookshelf.knex.raw(groupbyBidsql2).then((data) => {
        groupbyBid2.push(data.rows);
      });
      if (groupbyBid2[0].length > 0) {
        for (let eachobj of groupbyBid2[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlbid = `select c.*,
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
  where c."created_at"='${create}' and c."seller_id"=${req.body.loggedUser} and c."expiry_day"=${eachobj.expiry_day}
  and c."product_id"=${eachobj.product_id} and type_of='bid' and c.bidder_id=${eachobj.bidder_id}
  and c.type_of_offer='Accept' and c.is_deleted='false' and (c.status!='decline' or c.status is null)
  and c.type_of='bid' and c.expiry_date > now() AT TIME ZONE 'UTC'
  and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlbid)
            .then((data) => {
              result4.acceptBid.push(data);
            })
            .catch((err) => {
              console.log('err');
            });
        }
      }
      if (groupbyAsk1[0].length > 0) {
        for (let eachobj of groupbyAsk1[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlask = `select c.*,
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
  where c."created_at"='${create}' and c."bidder_id"=${req.body.loggedUser} and c."expiry_day"=${eachobj.expiry_day}
  and c."product_id"=${eachobj.product_id} and c.seller_id=${eachobj.seller_id} and c.type_of_offer='Accept' and c.is_deleted='false'
  and c.type_of='ask' and c.expiry_date > now() AT TIME ZONE 'UTC'
  and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlask)
            .then((data) => {
              result4.acceptAsk.push(data);
            })
            .catch((err) => {
              console.log('err');
            });
        }
      }
      var ask = result4.acceptAsk;
      var bid = result4.acceptBid;
      // var temp = []
      // var temp1 = [];
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

      result1.selling = temp;
      result1.buying = temp1;
      result.acceptAsk = temp;
      result.acceptBid = temp1;

      return res.json(Response(constant.statusCode.ok, 'Active Offer fetched', result));
      // return res.json(Response(constant.statusCode.ok, "Active Offer fetched", result));
    } catch (err) {
      console.log('err in getAcceptOfferByUserId');
    }
  }
  getAcceptOfferByUserIds().then((response) => {});
}

function getClosedOfferByUserId(req, res) {
  async function getClosedOfferByUserId() {
    try {
      let result = {};

      sqlask = `select c.*,
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
       where 
       (c."bidder_id"=${req.body.loggedUser}  or c."seller_id"=${req.body.loggedUser} ) 
       
       and (o."status" = 'accept' or o."status" = 'decline' or c."track_no" is not null or f."feedback_by_bidder" is not null ) 
       and ( type_of='bid' or type_of='ask') and c.is_deleted='false' ORDER BY c.id desc`;

      await bookshelf.knex
        .raw(sqlask)
        .then((data) => {
          result = data.rows;
        })
        .catch((err) => {
          console.log('err');
        });

      return res.json(Response(constant.statusCode.ok, 'Closed Offer fetched', result));
    } catch (err) {
      console.log('err in getActiveOfferByUserId');
    }
  }
  getClosedOfferByUserId().then((respond) => {});
}

function getRecievedOffers(req, res) {
  async function getRecievedOffers() {
    try {
      let result = {
        acceptAsk: [],
        acceptBid: [],
      };
      let groupbyAsk = [];
      let groupbyBid = [];

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
          sqlbid = `select c.*,
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

      var bid = result.acceptBid;

      var temp1 = [];
      var temp = [];

      for (var i = 0; i < bid.length; i++) {
        for (var j = 0; j < bid[i].rows.length; j++) {
          temp1.push(bid[i].rows[j]);
        }
      }

      console.log('searchArray no search ***************************');
      let result1 = {
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
          sqlbid = `select c.*,
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
        where c."created_at"='${create}' and c."seller_id"=${eachobj.seller_id}
        and c."expiry_day"=${eachobj.expiry_day}
      
        and c."product_id"=${eachobj.product_id} and c.bidder_id=${eachobj.bidder_id}
        and c.is_deleted='false'
        and c."status" = 'accept'
        and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlbid)
            .then((data) => {
              // console.log('data in buy query----->', data.rows)
              result1.buying.push(data);
            })
            .catch((err) => {
              console.log('err in buy query', err);
            });
        }
      }
      var buy = result1.buying;

      for (var i = 0; i < buy.length; i++) {
        for (var j = 0; j < buy[i].rows.length; j++) {
          temp1.push(buy[i].rows[j]);
        }
      }

      let result2 = {};

      sqlbid = `select c.*,
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
            where (c."bidder_id"=${req.body.loggedUser})
            and (c.expiry_date > now() AT TIME ZONE 'UTC' and c.is_deleted=false and c.type_of_offer='Counter' and c.type_of='bid' );`;
      await bookshelf.knex
        .raw(sqlbid)
        .then((data) => {
          result2.counterBid = data;
        })
        .catch((err) => {
          console.log('err');
        });

      var buy1 = result2.counterBid;

      for (var i = 0; i < buy1.length; i++) {
        for (var j = 0; j < buy1[i].rows.length; j++) {
          temp1.push(buy1[i].rows[j]);
        }
      }

      //             let result4 = {
      //                 acceptAsk: [],
      //                 acceptBid: []
      //             };
      //             let groupbyBid2 = [];

      //             let groupbyBidsql2 = `select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id
      //   from counters where seller_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
      //   and type_of='bid' and expiry_date > now() AT TIME ZONE 'UTC'
      //   group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id ;`
      //             await bookshelf.knex.raw(groupbyBidsql2).then(data => {
      //                 groupbyBid2.push(data.rows)
      //             });
      //             if (groupbyBid2[0].length > 0) {
      //                 for (let eachobj of groupbyBid2[0]) {
      //                     let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
      //                     sqlbid = `select c.*,
      //                     i."imageUrl",
      //                     a.type,a."producttype",
      //                     s.user_name as sellerUserName,
      //                     p."productName" as product_name,
      //                     b.user_name as bidderUserName,
      //                     O.id as order_id,O."status" as "order_status", O."delivered", O."createdbyId", O."track_no",O."courier",O."paymentdetail",
      //                     f."feedback_by_seller" as seller_feedback, f."feedback_by_bidder" as bidder_feedback
      //                from counters c
      //                LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
      //                LEFT OUTER JOIN images i on i."productId" = c."product_id"
      //                LEFT OUTER JOIN users s on s.id = c."seller_id"
      //                LEFT OUTER JOIN users b on b.id = c."bidder_id"
      //                LEFT OUTER JOIN products p on p.id = c."product_id"
      //                LEFT OUTER JOIN orders O on c.id = O."counter_id"
      //                LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"
      //   where c."created_at"='${create}' and c."seller_id"=${req.body.loggedUser} and c."expiry_day"=${eachobj.expiry_day}
      //   and c."product_id"=${eachobj.product_id} and type_of='bid' and c.bidder_id=${eachobj.bidder_id}
      //   and c.type_of_offer='Accept' and c.is_deleted='false' and (c.status!='decline' or c.status is null)
      //   and c.type_of='bid' and c.expiry_date > now() AT TIME ZONE 'UTC'
      //   and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `
      //                     await bookshelf.knex.raw(sqlbid)
      //                         .then(data => {
      //                             result4.acceptBid.push(data);
      //                         })
      //                         .catch(err => {
      //                             console.log("err")
      //                         })
      //                 }
      //             }

      //             var bid = result4.acceptBid;

      //             for (var i = 0; i < bid.length; i++) {
      //                 for (var j = 0; j < bid[i].rows.length; j++) {
      //                     temp1.push(bid[i].rows[j])
      //                 }
      //             }

      let groupbyAsksql = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id
      from counters where seller_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false' 
      and type_of='ask' and expiry_date > now() AT TIME ZONE 'UTC' 
      group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id ;`;
      await bookshelf.knex.raw(groupbyAsksql).then((data) => {
        groupbyAsk.push(data.rows);
      });

      if (groupbyAsk[0].length > 0) {
        for (let eachobj of groupbyAsk[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlask = `select c.*,
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
      for (var i = 0; i < ask.length; i++) {
        for (var j = 0; j < ask[i].rows.length; j++) {
          temp1.push(ask[i].rows[j]);
        }
      }

      result1.selling = temp;
      result1.buying = temp1;
      result.acceptAsk = temp;
      result.acceptBid = temp1;

      return res.json(Response(constant.statusCode.ok, 'Active Offer fetched', result));
      // return res.json(Response(constant.statusCode.ok, "Active Offer fetched", result));
    } catch (err) {
      console.log('err in getRecievedOffers');
    }
  }
  getRecievedOffers().then((response) => {});
}

function getSentOffers(req, res) {
  async function getSentOffers() {
    try {
      let result = {
        acceptAsk: [],
        acceptBid: [],
      };
      let groupbyAsk = [];
      let groupbyBid = [];
      var temp = [];
      var temp1 = [];

      //         let groupbyAsksql = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id
      //   from counters where seller_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
      //   and type_of='ask' and expiry_date > now() AT TIME ZONE 'UTC'
      //   group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id ;`
      //         await bookshelf.knex.raw(groupbyAsksql).then(data => {
      //             groupbyAsk.push(data.rows)
      //         });

      //         if (groupbyAsk[0].length > 0) {
      //             for (let eachobj of groupbyAsk[0]) {
      //                 let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
      //                 sqlask = `select c.*,
      //                 i."imageUrl",
      //                 a.type,a."producttype",
      //                 s.user_name as sellerUserName,
      //                 p."productName" as product_name,
      //                 b.user_name as bidderUserName,
      //                 O.id as order_id,O."status" as "order_status", O."delivered", O."createdbyId", O."track_no",O."courier",O."paymentdetail",
      //                 f."feedback_by_seller" as seller_feedback, f."feedback_by_bidder" as bidder_feedback
      //            from counters c
      //            LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
      //            LEFT OUTER JOIN images i on i."productId" = c."product_id"
      //            LEFT OUTER JOIN users s on s.id = c."seller_id"
      //            LEFT OUTER JOIN users b on b.id = c."bidder_id"
      //            LEFT OUTER JOIN products p on p.id = c."product_id"
      //            LEFT OUTER JOIN orders O on c.id = O."counter_id"
      //            LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"
      //             where c."created_at"='${create}' and c."bidder_id"=${eachobj.bidder_id} and c."expiry_day"=${eachobj.expiry_day}
      //              and c."product_id"=${eachobj.product_id} and c.seller_id=${req.body.loggedUser} and c.type_of_offer='Accept' and c.is_deleted='false'
      //             and c.type_of='ask' and c.expiry_date > now() AT TIME ZONE 'UTC'
      //             and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `
      //                 await bookshelf.knex.raw(sqlask)
      //                     .then(data => {
      //                         result.acceptAsk.push(data);
      //                     })
      //                     .catch(err => {
      //                         console.log("err")
      //                     })
      //             }
      //         }
      //         var ask = result.acceptAsk;
      //         for (var i = 0; i < ask.length; i++) {
      //             for (var j = 0; j < ask[i].rows.length; j++) {
      //                 temp.push(ask[i].rows[j])
      //             }
      //         }

      console.log('searchArray no search ***************************');
      let result1 = {
        selling: [],
        buying: [],
      };
      let groupbySelling = [];

      let groupbySellingsql = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status
        from counters where seller_id=${req.body.loggedUser} and (status='accept' or status='decline')
        and is_deleted='false'  group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id,status ;`;
      await bookshelf.knex.raw(groupbySellingsql).then((data) => {
        // console.log('selling query res----------------------', data.rows)
        groupbySelling.push(data.rows);
      });

      if (groupbySelling[0].length > 0) {
        for (let eachobj of groupbySelling[0]) {
          let create1 = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlask = `select c.*,
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
        where c."created_at"='${create1}' and
        c."bidder_id"=${eachobj.bidder_id} and c."expiry_day"=${eachobj.expiry_day}
        and c."product_id"=${eachobj.product_id}
        and c."status" = 'accept'
        and c.seller_id=${eachobj.seller_id} and c.is_deleted='false'
        and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlask)
            .then((data) => {
              // console.log('data in sell query----->', data.rows)
              result1.selling.push(data);
            })
            .catch((err) => {
              console.log('err in sell query', err);
            });
        }
      }
      var sell = result1.selling;
      for (var i = 0; i < sell.length; i++) {
        for (var j = 0; j < sell[i].rows.length; j++) {
          temp.push(sell[i].rows[j]);
        }
      }

      let result2 = {};

      sqlask = `select c.*,
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
            where (c."seller_id"=${req.body.loggedUser})
            and (c.expiry_date > now() AT TIME ZONE 'UTC' and c.is_deleted=false and c.type_of_offer='Counter' and c.type_of='ask' );`;
      await bookshelf.knex
        .raw(sqlask)
        .then((data) => {
          result2.counterAsk = data;
        })
        .catch((err) => {
          console.log('err');
        });

      var sell1 = result2.counterAsk;
      for (var i = 0; i < sell1.length; i++) {
        for (var j = 0; j < sell1[i].rows.length; j++) {
          temp.push(sell1[i].rows[j]);
        }
      }

      let result4 = {
        acceptAsk: [],
        acceptBid: [],
      };
      let groupbyAsk1 = [];
      let groupbyBid2 = [];
      let groupbyAsksql1 = `select created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id
  from counters where bidder_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
  and type_of='ask' and expiry_date > now() AT TIME ZONE 'UTC'
  group by created_at,product_id,expiry_day,bidder_id,bid_and_ask_id,seller_id ;`;
      await bookshelf.knex.raw(groupbyAsksql1).then((data) => {
        groupbyAsk1.push(data.rows);
      });
      if (groupbyAsk1[0].length > 0) {
        for (let eachobj of groupbyAsk1[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlask = `select c.*,
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
  where c."created_at"='${create}' and c."bidder_id"=${req.body.loggedUser} and c."expiry_day"=${eachobj.expiry_day}
  and c."product_id"=${eachobj.product_id} and c.seller_id=${eachobj.seller_id} and c.type_of_offer='Accept' and c.is_deleted='false'
  and c.type_of='ask' and c.expiry_date > now() AT TIME ZONE 'UTC'
  and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlask)
            .then((data) => {
              result4.acceptAsk.push(data);
            })
            .catch((err) => {
              console.log('err');
            });
        }
      }
      var ask = result4.acceptAsk;
      // var temp = []
      // var temp1 = [];
      for (var i = 0; i < ask.length; i++) {
        for (var j = 0; j < ask[i].rows.length; j++) {
          temp.push(ask[i].rows[j]);
        }
      }

      // let result4 = {
      //     acceptAsk: [],
      //     acceptBid: []
      // };
      // let groupbyBid2 = [];

      let groupbyBidsql2 = `select created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id
  from counters where seller_id=${req.body.loggedUser} and type_of_offer='Accept' and is_deleted='false'
  and type_of='bid' and expiry_date > now() AT TIME ZONE 'UTC'
  group by created_at,product_id,expiry_day,seller_id,bid_and_ask_id,bidder_id ;`;
      await bookshelf.knex.raw(groupbyBidsql2).then((data) => {
        groupbyBid2.push(data.rows);
      });
      if (groupbyBid2[0].length > 0) {
        for (let eachobj of groupbyBid2[0]) {
          let create = `${moment(eachobj.created_at).format('YYYY-MM-DD')}`;
          sqlbid = `select c.*,
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
  where c."created_at"='${create}' and c."seller_id"=${req.body.loggedUser} and c."expiry_day"=${eachobj.expiry_day}
  and c."product_id"=${eachobj.product_id} and type_of='bid' and c.bidder_id=${eachobj.bidder_id}
  and c.type_of_offer='Accept' and c.is_deleted='false' and (c.status!='decline' or c.status is null)
  and c.type_of='bid' and c.expiry_date > now() AT TIME ZONE 'UTC'
  and c."bid_and_ask_id"=${eachobj.bid_and_ask_id}; `;
          await bookshelf.knex
            .raw(sqlbid)
            .then((data) => {
              result4.acceptBid.push(data);
            })
            .catch((err) => {
              console.log('err');
            });
        }
      }

      var bid = result4.acceptBid;

      for (var i = 0; i < bid.length; i++) {
        for (var j = 0; j < bid[i].rows.length; j++) {
          temp.push(bid[i].rows[j]);
        }
      }

      result1.selling = temp;
      result1.buying = temp1;
      result.acceptAsk = temp;
      result.acceptBid = temp1;

      return res.json(Response(constant.statusCode.ok, 'Active Offer fetched', result));
      // return res.json(Response(constant.statusCode.ok, "Active Offer fetched", result));
    } catch (err) {
      console.log('err in getSentOffers');
    }
  }
  getSentOffers().then((response) => {});
}

function getAcceptOfferByUserId(req, res) {
  async function getAcceptOfferByUserId() {
    try {
      let result = {};

      sqlask = `select c.*,
            i."imageUrl",
            a.type as bid_and_ask_type ,a."producttype",
            s.user_name as sellerUserName,  
            p."productName" as product_name, cat."categoryName",
            b.user_name as bidderUserName,
            O.payment_date, 
            O.id as order_id,O."status" as "order_status", O."delivered", O."createdbyId", O."track_no",O."courier",O."paymentdetail",
            f."feedback_by_seller" as seller_feedback, f."feedback_by_bidder" as bidder_feedback 
       from counters c
       LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
       LEFT OUTER JOIN images i on i."productId" = c."product_id"
       LEFT OUTER JOIN users s on s.id = c."seller_id"
       LEFT OUTER JOIN users b on b.id = c."bidder_id"
       LEFT OUTER JOIN products p on p.id = c."product_id"
       LEFT OUTER JOIN category cat on cat.id = p."categoryId"
       LEFT OUTER JOIN orders O on c.id = O."counter_id"
       LEFT OUTER JOIN feedbacks f on c.id = f."counters_id"  
        where  (c."seller_id"=${req.body.id}   or c.bidder_id = ${req.body.id}) and c.is_deleted=false  ORDER BY c.id desc`;

      await bookshelf.knex
        .raw(sqlask)
        .then((data) => {
          result = data.rows;
        })
        .catch((err) => {
          console.log('err');
        });

      return res.json(Response(constant.statusCode.ok, 'Closed Offer fetched', result));
    } catch (err) {
      console.log('err in getActiveOfferByUserId');
    }
  }
  getAcceptOfferByUserId().then((respond) => {});
}

function getCounters(req, res) {
  async function getCounters() {
    try {
      let sql = `select c.*,
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
 LEFT OUTER JOIN feedbacks f on c.id = f."counters_id" where c.id =${req.body.counter_id}`;

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
  getCounters().then((data) => {});
}

async function getUsers(req, res) {
  const user_id = req.body.user_id;
  const user_ids = await bookshelf.knex('rooms').where({ sender_id: user_id }).orWhere({ receiver_id: user_id });
  const allUsers = await bookshelf.knex('users');
  const ids = [];
  var filteredUsers = [];
  user_ids.forEach((user_id) => {
    if (user_id.sender_id != req.body.user_id) {
      ids.push({ user_id: user_id.sender_id, room_id: user_id.id });
    } else if (user_id.receiver_id != req.body.user_id) {
      ids.push({ user_id: user_id.receiver_id, room_id: user_id.id });
    }
  });
  ids.forEach((id) => {
    for (var i = 0; i < allUsers.length; i++) {
      if (allUsers[i].id == id.user_id) {
        allUsers[i].room_id = id.room_id;
        filteredUsers.push(allUsers[i]);
        break;
      }
    }
  });

  for (i = 0; i < filteredUsers.length; i++) {
    var last_message = [{ body: '' }];
    const message_id = await bookshelf.knex('messages').where({ room_id: filteredUsers[i].room_id }).max('id');
    if (message_id[0].max !== null) {
      last_message = await bookshelf.knex('messages').where({ id: message_id[0].max });
      if (last_message[0].body.split('')[0] === '{') {
        last_message[0].body = 'Counter Offer';
      }
    }
    filteredUsers[i].last_message = last_message[0].body;
  }

  return res.json({
    users: filteredUsers,
  });
}

function getChatOfferList(req, res) {
  async function getChatOfferList() {
    try {
      let result = {};

      sqlask = `select c.*,
      i."imageUrl",
      a.type as bid_and_ask_type ,a."producttype",
      s.user_name as sellerUserName,  
      p."productName" as product_name, cat."categoryName",
      b.user_name as bidderUserName,
      O.payment_date, O.shipment_date,
      O.id as order_id,O."status" as "order_status", O."delivered", O."createdbyId", O."track_no",O."courier",O."paymentdetail",
      f."feedback_by_seller" as seller_feedback, f."feedback_by_bidder" as bidder_feedback 
 from counters c
 LEFT OUTER JOIN bid_and_ask a on a.id = c."bid_and_ask_id"
 LEFT OUTER JOIN images i on i."productId" = c."product_id"
 LEFT OUTER JOIN users s on s.id = c."seller_id"
 LEFT OUTER JOIN users b on b.id = c."bidder_id"
 LEFT OUTER JOIN products p on p.id = c."product_id"
 LEFT OUTER JOIN category cat on cat.id = p."categoryId"
 LEFT OUTER JOIN orders O on c.id = O."counter_id"
 LEFT OUTER JOIN feedbacks f on c.id = f."counters_id" 
  where  ((c."seller_id"= ${req.body.sid}  and c.bidder_id = ${req.body.uid} ) or (c."seller_id"= ${req.body.uid}   and c.bidder_id =  ${req.body.sid})) and
  (c.status is NULL or c.status='accept') and (O."track_no" is NULL or O."paymentdetail" is NULL) and c.is_deleted=false  ORDER BY c.id desc `;

      await bookshelf.knex
        .raw(sqlask)
        .then((data) => {
          result = data.rows;
        })
        .catch((err) => {
          console.log('err');
        });

      return res.json(Response(constant.statusCode.ok, 'Closed Offer fetched', result));
    } catch (err) {
      console.log('err in getActiveOfferByUserId');
    }
  }
  getChatOfferList().then((respond) => {});
}
