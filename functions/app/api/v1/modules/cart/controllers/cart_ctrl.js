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
var cartModel = require('../models/cart_model');
var common_query = require('../../../../../utils/commonQuery');
var Response = require('../../../../../utils/response');
var constant = require('../../../../../utils/constants');
var SettingModel = require('../../admin_settings/models/admin_setting_models');
var cron = require('node-cron');
const uuidv4 = require('uuid/v4');
module.exports = {
  addToCart,
  fetchCartData,
  deleteCartItem,
  sendOfferFromCart,
};

cron.schedule('0 8 * * *', async () => {
  // delete from cart
  // let startdate = `${moment().utc().format('YYYY-MM-DD')}`
  // let new_date_expiry = new Date(startdate).setDate(new Date(startdate).getDate()+1)
  let todays_expire = `${moment().utc().format('YYYY-MM-DD')}`;
  console.log('todays_expire', todays_expire);
  const condition = {
    expireAt: todays_expire,
    // isCheckout: false
  };
  const deleteUpdate = {
    isDeleted: true,
  };

  const toDeleteData = await common_query.findAllData(cartModel, condition).catch((err) => {
    console.log('errrrrr', err);
  });
  // console.log('toDeleteData', toDeleteData.data.toJSON())
  if (toDeleteData) {
    if (toDeleteData.data.toJSON().length) {
      let arrData = toDeleteData.data.toJSON();
      async.forEachOf(arrData, async (value, key, cb) => {
        const condition1 = {
          expireAt: todays_expire,
          id: value.id,
        };
        const deleteData = await common_query.updateRecord(cartModel, deleteUpdate, condition1).catch((err) => {
          console.log('errrrrorrrrr', err);
        });
        // console.log('deleteDatadeleteData', deleteData);
      });
    }
  }
});

function sendOfferFromCart(req, res) {
  async function async_fun() {
    try {
    } catch (error) {}
  }
  async_fun();
}

function addToCart(req, res) {
  async function async_fun() {
    try {
      // console.log('**************************************', req.body)
      async.forEachOf(
        req.body.products,
        async (value, key, cb) => {
          // console.log('valuesssss', value)
          // const condition = {
          //     user_id: req.body.userid,
          //     bidask_id: value.id
          // }
          // const cartData = await common_query.findAllData(cartModel, condition).catch(err => {
          //     throw err
          // })
          console.log('cartData************');
          // console.log('.data.length', cartData.data.length)
          // if (!cartData.data.length) {
          const setting_condition = {
            settingname: 'cartsetting',
          };
          let expiryDay = await common_query.findAllData(SettingModel, setting_condition).catch((err) => {
            throw err;
          });
          let expiryDayToJson = expiryDay.data.toJSON();
          parseInt(expiryDayToJson[0].settingvalue.days);
          console.log('insise************', parseInt(expiryDayToJson[0].settingvalue.days));
          let startdate = `${moment().utc().format('YYYY-MM-DD')}`;
          // let new_date_expiry = moment(startdate, "YYYY-MM-DD").add(parseInt(expiryDayToJson[0].settingvalue.day), 'days');
          let new_date_expiry = new Date(startdate).setDate(new Date(startdate).getDate() + parseInt(expiryDayToJson[0].settingvalue.days));
          let exp_date = `${moment(new_date_expiry).utc().format('YYYY-MM-DD')}`;
          console.log('new_date_expiry', exp_date, 'startdate', startdate);
          const dataToinsert = {
            user_id: req.body.userid,
            bidask_id: value.id,
            createdAt: `${moment().utc().format('YYYY-MM-DD')}`,
            updatedAt: `${moment().utc().format('YYYY-MM-DD')}`,
            isDeleted: false,
            isCheckout: false,
            expireAt: exp_date,
          };
          const success = await common_query.saveRecord(cartModel, dataToinsert).catch((err) => {
            throw err;
          });
          // console.log('successsuccess', success)

          const bidaskUpdate = {
            isaddtocart: true,
          };
          const bidask_condition = {
            id: parseInt(value.id),
          };
          // console.log('condition for bidask', bidask_condition)
          const b_data = await common_query.updateRecord(bidsasksModel, bidaskUpdate, bidask_condition).catch((err) => {
            throw err;
          });
          // console.log('b_data++++++++++++++++++++',b_data)
          // }
          // else {
          //     const bidask_condition = {
          //         // createdbyId: req.body.userid,
          //         id: parseInt(value.id)
          //     }
          //     // console.log('condition for bidask', bidask_condition)

          //     let cartD = cartData.data.toJSON()
          //     // console.log('cartD', cartD, 'cartDDD')
          //     if (cartD[0].isDeleted) {
          //         let startdate = `${moment().utc().format('YYYY-MM-DD')}`
          //         let new_date_expiry = moment(startdate, "YYYY-MM-DD").add(5, 'days');
          //         const prodcutToupdate = {
          //             updatedAt: `${moment().utc().format('YYYY-MM-DD')}`,
          //             isDeleted: false,
          //             isCheckout: false,
          //             expireAt: new_date_expiry
          //         }

          //         await common_query.updateRecord(cartModel, prodcutToupdate, condition).catch(err => {
          //             throw err
          //         })
          //         const bidaskUpdate = {
          //             isaddtocart: true
          //         }

          //         const b_data = await common_query.updateRecord(bidsasksModel, bidaskUpdate, bidask_condition).catch(err => {
          //             throw err
          //         })

          //     }
          //     const bidaskUpdate = {
          //         isaddtocart: true
          //     }

          //     const b_data = await common_query.updateRecord(bidsasksModel, bidaskUpdate, bidask_condition).catch(err => {
          //         throw err
          //     })

          // }
        },
        function (err) {
          if (err) {
            throw err;
          } else {
            return res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, {}));
          }

          // configs is now a map of JSON data
          // doSomethingWith(configs);
        }
      );
    } catch (error) {
      console.log('errroerrrr', error);
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  async_fun();
}

function fetchCartData(req, res) {
  async function async_fun() {
    try {
      const condition = {
        'cart.user_id': req.body.userid,
        'cart.isDeleted': false,
        // "cart.isCheckout": false
      };
      new cartModel()
        .where(condition)
        .query(_filter)
        .where({ 'bid_and_ask.request': 'asks' })
        .query(_filter1)
        .query(function (qb) {
          qb.columns([
            'bid_and_ask.*',
            'users.first_name as created_by_id_firstname',
            'users.last_name as created_by_id_lastname',
            'users.id as uid',
            'users.profile_image_url',
            'users.user_name',
            'users.term_shipping as termsShipping',
            'users.payment_mode as paymentMode',
            'users.payment_timing as paymentTiming',
            'users.additional_term as additionalTerms',
            'users.shipping_address as shippingAddress',
            'users.company_logo',
            'products.productName',
            'images.imageUrl',
            'cart.*',
          ]);
          qb.orderBy('bid_and_ask.amount', 'ASC');
        })
        .fetchAll()
        .then(function (askCartListResult) {
          let groupaskResult = _.chain(askCartListResult.toJSON())
            // Group the elements of Array based on `uid` property
            .groupBy('uid')
            // `key` is group's name (uid), `value` is the array of objects
            .map((value, key) => ({ uid: key, data: value }))
            .value();
          // console.log('groupResult***************', groupaskResult)
          let countAsk = 0;
          groupaskResult.forEach((item, index) => {
            countAsk = countAsk + item.data.length;
          });
          new cartModel()
            .where(condition)
            .query(_filter)
            .where({ 'bid_and_ask.request': 'bids' })
            .query(_filter1)
            .query(function (qb) {
              qb.columns([
                'bid_and_ask.*',
                'users.first_name as created_by_id_firstname',
                'users.last_name as created_by_id_lastname',
                'users.id as uid',
                'users.user_name',
                'users.profile_image_url',
                'users.term_shipping as termsShipping',
                'users.payment_mode as paymentMode',
                'users.payment_timing as paymentTiming',
                'users.additional_term as additionalTerms',
                'users.shipping_address as shippingAddress',
                'products.productName',
                'users.company_logo',
                'images.imageUrl',
                'cart.*',
              ]);
              qb.orderBy('bid_and_ask.amount', 'ASC');
            })
            .fetchAll()
            .then((bidCartResult) => {
              let groupBidResult = _.chain(bidCartResult.toJSON())
                // Group the elements of Array based on `uid` property
                .groupBy('uid')
                // `key` is group's name (uid), `value` is the array of objects
                .map((value, key) => ({ uid: key, data: value }))
                .value();
              // console.log('groupResult***************', groupBidResult)
              let countBid = 0;

              groupBidResult.forEach((item, index) => {
                countBid = countBid + item.data.length;
              });

              const finalData = {
                ask: groupaskResult,
                bid: groupBidResult,
                cartCount: countBid + countAsk,
              };

              return res.json(Response(constant.statusCode.ok, constant.messages.dataFetchedSuccess, finalData));
            });
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
    } catch (error) {
      console.log('errorrrr', error);
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }

    function _filter(qb) {
      // qb.joinRaw(`LEFT JOIN users ON (cart."user_id" = users.id)`);
      qb.joinRaw(`LEFT JOIN bid_and_ask ON (cart."bidask_id" = bid_and_ask.id)`);
    }
    function _filter1(qb) {
      qb.joinRaw(`LEFT JOIN users ON (bid_and_ask."createdbyId" = users.id)`);
      qb.joinRaw(`LEFT JOIN products ON (bid_and_ask."productId" = products.id)`);
      qb.joinRaw(`LEFT JOIN images ON (bid_and_ask."productId" = images."productId")`);
    }
  }
  async_fun();
}

function deleteCartItem(req, res) {
  async function async_fun() {
    try {
      console.log('reqbody', req.body);
      let updatedata = {
        isDeleted: true,
        updatedAt: `${moment().utc().format('YYYY-MM-DD')}`,
      };
      let condition = {
        id: parseInt(req.body.bidask_id), // bidask_id is not bid ask but cart id
        user_id: parseInt(req.body.user_id),
      };

      let updateCartData = await common_query.updateRecord(cartModel, updatedata, condition);
      // console.log('update cart', updateCartData)
      // const bidaskUpdate = {
      //     isaddtocart: false
      // }
      // const bidask_condition = {
      //     id: parseInt(req.body.bidask_id)
      // }
      // // console.log('condition for bidask', bidask_condition)
      // const b_data = await common_query.updateRecord(bidsasksModel, bidaskUpdate, bidask_condition).catch(err => {
      //     throw err
      // })

      if (updateCartData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.DeleteSuccess, updateCartData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, {}));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, {}));
    }
  }
  async_fun();
}

///// */
/**
 * User should be albe to cart multiple times same product
 * When user deletes from cart it should only get deleted from cart and no where it should get reflected
 * change the api for add to cart in product contoller change for isaddtocart
 * cron days is need to be added in setting page
 *
 * for bulk upload we need export all the product data (give export button)
 * then if user changes 1 product name then (update the data)
 * also check for duplicate
 *
 * if the product id is present the check the category and subcategory duplicate
 * if yes then donot update then update by product id
 * if id not present the check for duplicate and
 *
 *
 *
 *
 *
 *
 */

/**
 * In the chat
 * User A will have A==B save as one table for socket_room
 * you can save it different as well
 * on click of reply check for if user is there inthe contct list
 * if not then
 */
