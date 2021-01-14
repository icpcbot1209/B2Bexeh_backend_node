var bookshelf = __rootRequire("app/config/bookshelf");
var config = __rootRequire("app/config/config").get("local");
var Joi = require("joi");
var moment = require("moment");
var crypto = __rootRequire("app/utils/crypto");
var loader = __rootRequire("app/api/v1/loader");
var santize = __rootRequire("app/utils/santize");
var i18n = require("i18n");
var fs = require("fs");
var _ = require("lodash");
var __ = require("underscore");
var text = __rootRequire("app/utils/text");
var utility = require("../../../../../utils/utility");
var async = require("async");
var mkdirp = require("mkdirp");
var ProductModel = loader.loadModel("/product/models/product_models");
var cartModel = require("../../cart/models/cart_model");
var CounterModel = loader.loadModel("/product/models/counteroffer_models");
var CatSubcatMappingModel = loader.loadModel("/product/models/catsubcatmapping_models");
var imageModel = loader.loadModel("/images/models/image_models");
var categoryModel = require("../../category/models/category_models");
var subcategoryModel = require("../../subcategory/models/subcategory_models");
var ChatOfferModels = require("../../chat/models/chat_offer_models");
var chatModels = require("../../chat/models/chat_models");
// var AddressModel = loader.loadModel('/address/models/address_models');
var roomModel = require("../../bidsAsks/models/room_models");
var contactModel = require("../../bidsAsks/models/contact_models");
var chatModel = require("../../chat/models/chat_models");
var jwt = require("jsonwebtoken");
// var MetricesSettingProviderModel = loader.loadModel('/metrices_setting_provider/models/metrices_setting_provider_model');
// var MetricesSettingModel = loader.loadModel('/metrices_setting/models/metrices_setting_model');
var constant = require("../../../../../utils/constants");
var common_query = require("../../../../../utils/commonQuery");
var Response = require("../../../../../utils/response");
var s3file_upload = require("../../../../../utils/fileUpload");
// var config = require('../../../../../config/config');
// require('')
// const uuidv4 = require('uuid/v4');
const { v4: uuidv4 } = require("uuid");
const csv = require("csv-parser");
const formidable = require("formidable");
const randomize = require("randomatic");
var Config = __rootRequire("app/config/config").get("default");

var AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: Config.AWS_KEY.ACCESS_KEY_ID, // fetched from Config file based on the environment
  secretAccessKey: Config.AWS_KEY.SECRET_ACCESS_KEY,
});
var s3 = new AWS.S3();
module.exports = {
  saveProduct,
  getProductDetails,
  getAllProducts,
  getAllCategorysYears,
  getAllproductByYears,
  editProduct,
  updateProductImage,
  deleteProduct,
  getAllCategorysYearstest,
  getAllNewProduct,
  getProductById,
  getNewListingProduct,
  getSearchList,
  getAllNewProductToday,
  getAllNewProductTwodays,
  getAllNewProductThreedays,
  getProduct,
  getPopularProduct,
  productFeatureChange,
  createCounter,
  saveCategoryMapping,
  bulkUpload,
  exportcsvBulkUpload,
};

function exportcsvBulkUpload(req, res) {
  async function async_fun() {
    try {
      const condition = {
        "products.isdeleted": false,
      };

      new ProductModel()
        .where(condition)
        .query(_filter)
        .where({ "category.isdeleted": false, "subcategory.isdeleted": false })
        .query(function (qb) {
          qb.columns([
            "products.id as Product_No",
            "products.productName as Product_Name",
            "category.categoryName as Category",
            "subcategory.subcategory_name as SubCategory",
          ]);
          qb.orderBy("products.id", "ASC");
        })
        .fetchAll()
        .then((productData) => {
          let products = productData.toJSON();
          if (products.length) {
            return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, products));
          } else {
            return res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound));
          }
        });

      // const productData = await common_query.findAllData(ProductModel, condition).catch(err => {
      //   throw err
      // })
      // console.log('productDataproductData', productData.data.toJSON())
      // let products = productData.data.toJSON()
      // let productArr=[]
      // async.forEachOf(productData.data.toJSON(),function(value,key,callback){
      //   productArr.push({
      //     product_no:value.id,
      //     product_name:value.productName,
      //     category:
      //   })
      // })
    } catch (error) {
      console.log("errorerrorerror", error);
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }

    function _filter(qb) {
      // qb.joinRaw(`LEFT JOIN users ON (cart."user_id" = users.id)`);
      qb.joinRaw(`LEFT JOIN category ON (products."categoryId" = category.id)`);
      qb.joinRaw(`LEFT JOIN subcategory ON (products."subcategoryId" = subcategory.id)`);
    }
  }
  async_fun();
}

function productFeatureChange(req, res) {
  async function productFeatureChangeMethod() {
    var updatedata = {
      is_featured: req.body.is_featured ? req.body.is_featured : false,
    };
    let condition = {
      id: req.body.id,
    };
    try {
      let updateUserData = await common_query.updateRecord(ProductModel, updatedata, condition);
      if (updateUserData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  productFeatureChangeMethod().then((data) => {});
}

function createCounter(req, res) {
  async function createCounter() {
    try {
      var is_private = false;
      if (req.body.is_private === true) {
        is_private = true;
      }
      var transaction_number = "";
      /**
       * 1) check contact in if contact present if yes take the contact id
       *
       *
       */
      console.log("req req+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++", req.body);
      let reqType = Array.isArray(req.body);
      if (reqType) {
        console.log("array");
        let orderArr = [];
        async.forEachOf(
          req.body,
          async function (value, key, callback) {
            const {
              bid_and_ask_id,
              bidder_id,
              expiry_date,
              expiry_day,
              note,
              payment_method,
              payment_time,
              product_id,
              seller_id,
              type_of,
              type_of_offer,
              is_deleted,
              amount,
              qty,
              type,
              // producttype,
              // imageUrl,
              // profile_image_url,
              // productName,
            } = value;
            transaction_number = randomize("A", 2);
            var val = Math.floor(1000 + Math.random() * 9000);
            transaction_number = transaction_number + val.toString();
            let data = {
              bid_and_ask_id,
              bidder_id,
              expiry_day,
              note,
              payment_method,
              payment_time,
              product_id,
              seller_id,
              type_of,
              type_of_offer,
              is_deleted,
              qty,
              amount,
              type,
              is_private,
              transaction_number,
              // producttype,
              // imageUrl,
              // profile_image_url,
              // productName
            };

            // let contact_id_for_chat;
            // if (value.seller_id && value.bidder_id) {
            //   let data = {
            //     user_id1: value.seller_id,
            //     user_id2: value.bidder_id,
            //     status: true,
            //     created_at: `${moment().utc().format('YYYY-MM-DD')}`,
            //     updated_at: `${moment().utc().format('YYYY-MM-DD')}`
            //   };

            //   let inRoom = await bookshelf.knex.raw(`select
            //    "id" from rooms where ("user_id1"= '${value.seller_id}' and "user_id2"= '${value.bidder_id}') or
            //    ("user_id2"= '${value.seller_id}' and "user_id1"= '${value.bidder_id}');`);
            //   // console.log('offer_idoffer_id', req.body.offer_id)
            //   if (inRoom.rowCount) {
            //     console.log('2')
            //     let rmCondition = {
            //       id: inRoom.rows[0].id
            //     }

            //     console.log('5')

            //     const update_rm = {
            //       status: true,
            //       updated_at: `${moment().utc().format('YYYY-MM-DD')}`
            //     }
            //     await common_query.updateRecord(roomModel, update_rm, rmCondition).catch(err => {
            //       throw err
            //     })

            //     const contact_chat_condition = {
            //       room_id: inRoom.rows[0].id,
            //       my_id: value.seller_id,
            //       my_contact_id: value.bidder_id
            //     }
            //     console.log('data contact_chat_condition id in line number 225', contact_chat_condition)

            //     let contactInfo = await common_query.findAllData(contactModel,
            //       contact_chat_condition).catch(err => {
            //         throw err
            //       })
            //     console.log('data contact id in line number 230', contactInfo.data.toJSON())

            //     if ((contactInfo.data.toJSON()).length) {
            //       contactInfo = contactInfo.data.toJSON()
            //       contact_id_for_chat = contactInfo[0].id;
            //       console.log('data contact id in line number 234', contact_id_for_chat)
            //     } else {
            //       let data = {
            //         my_id: req.body.seller_id,
            //         my_contact_id: req.body.bidder_id,
            //         isblocked: false,
            //         created_at: `${moment().utc().format('YYYY-MM-DD')}`,
            //         updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
            //         room_id: inRoom.rows[0].id,
            //       };
            //       await common_query.saveRecord(contactModel, data).catch(err => {
            //         throw err
            //       }).then(async data => {
            //         console.log('datata in line number 335');
            //         const contact_chat_condition = {
            //           room_id: inRoom.rows[0].id,
            //           my_id: value.seller_id,
            //           my_contact_id: value.bidder_id
            //         }
            //         console.log('datata in line number 343', contact_chat_condition);

            //         let contactInfo = await common_query.findAllData(contactModel,
            //           contact_chat_condition).catch(err => {
            //             throw err
            //           })
            //         console.log('datata in line number 349', contactInfo.data);

            //         contactInfo = contactInfo.data.toJSON()
            //         contact_id_for_chat = contactInfo[0].id;
            //         console.log('data contact id in line number 348', contact_id_for_chat)
            //       });
            //     }
            //   } else {
            //     console.log('datadatadatadata', data);
            //     let saveRoom = await common_query.saveRecord(roomModel, data).catch(err => {
            //       throw err
            //     });
            //     console.log('saveRoomsaveRoom', saveRoom.success.toJSON());
            //     let resp = saveRoom.success.toJSON()
            //     if (saveRoom) {
            //       let data = {
            //         my_id: value.seller_id,
            //         my_contact_id: value.bidder_id,
            //         isblocked: false,
            //         created_at: `${moment().utc().format('YYYY-MM-DD')}`,
            //         updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
            //         room_id: resp.id
            //       };
            //       let c2 = await common_query.saveRecord(contactModel, data).catch(err => {
            //         throw err
            //       }).then(async data1 => {
            //         console.log('datata in line number 335');
            //         const contact_chat_condition = {
            //           room_id: resp.id,
            //           my_id: value.seller_id,
            //           my_contact_id: value.bidder_id
            //         }

            //         let contactInfo = await common_query.findAllData(contactModel,
            //           contact_chat_condition).catch(err => {
            //             throw err
            //           })
            //         contactInfo = contactInfo.data.toJSON()
            //         contact_id_for_chat = contactInfo[0].id;
            //         console.log('data contact id in line number 348', contact_id_for_chat)

            //       });
            //       let data1 = {
            //         my_contact_id: value.seller_id,
            //         my_id: value.bidder_id,
            //         isblocked: false,
            //         created_at: `${moment().utc().format('YYYY-MM-DD')}`,
            //         updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
            //         room_id: resp.id
            //       };
            //       let c1 = await common_query.saveRecord(contactModel, data1).catch(err => {
            //         throw err
            //       });

            //     }
            //   }

            // }
            var expiredAt = moment()
              .utc()
              .add(expiry_day * 24, "hours")
              .format();
            var createdAt = `${moment().utc().format("YYYY-MM-DD")}`;
            data.expiry_date = expiredAt;
            data.created_at = createdAt;
            data.total_amount = qty * amount;
            console.log("data---", data);

            let counterData = await common_query.saveRecord(CounterModel, data).catch((err) => {
              throw err;
            });
            let counterArr = {};
            let cntrData = {};
            let userinfo = {};
            // imageUrl,
            // profile_image_url,
            // productName
            /**
             *    "users.term_shipping as termsShipping",
                        "users.payment_mode as paymentMode",
                        "users.payment_timing as paymentTiming",
                        "users.additional_term as additionalTerms",
                        "users.shipping_address as shippingAddress",
                        "users.company_logo",
             */
            userinfo.imageUrl = value.imageUrl;
            userinfo.profile_image_url = value.profile_image_url;
            userinfo.productName = value.productName;
            userinfo.firstname = value.firstname;
            userinfo.producttype = value.producttype;
            userinfo.lastname = value.lastname;
            userinfo.termsShipping = value.termsShipping;
            userinfo.paymentMode = value.paymentMode;
            userinfo.paymentTiming = value.paymentTiming;
            userinfo.additionalTerms = value.additionalTerms;
            userinfo.shippingAddress = value.shippingAddress;
            userinfo.company_logo = value.company_logo;
            userinfo.uid = value.uid;
            cntrData = counterData.success.toJSON();
            counterArr = value;

            const finlArr = {
              counterDataSave: cntrData,
              data: counterArr,
              userinfo: userinfo,
            };
            orderArr.push(finlArr);
            if (data.type_of == "ask") {
              var notObj = {
                created_by: data.bidder_id,
                content: "sent you an offer",
                destnation_user_id: data.seller_id,
              };
            } else {
              var notObj = {
                created_by: data.seller_id,
                content: "sent you an offer",
                destnation_user_id: data.bidder_id,
              };
            }

            utility.addNotification(notObj, function (err, resp) {
              if (err) {
                console.log("Error adding notification", err);
              } else {
                console.log("response after calling common add notification", resp);
              }
            });
            console.log("counterData---", counterData);

            let updateCheckoutdata = {
              isCheckout: true,
              updatedAt: `${moment().utc().format("YYYY-MM-DD")}`,
            };
            let conditionForCheckout = {
              user_id: parseInt(value.seller_id),
              bidask_id: parseInt(value.bid_and_ask_id),
            };
            console.log("conditionForCheckout---", conditionForCheckout);
            const findDatainCart = await common_query.findAllData(cartModel, conditionForCheckout).catch((err) => {
              throw err;
            });
            if (findDatainCart.data.length) {
              let test = await common_query
                .updateRecord(cartModel, updateCheckoutdata, conditionForCheckout)
                .catch((err) => {
                  throw err;
                });
            }

            // console.log('testttttttttttttttttttt', test)
          },
          function (err) {
            if (err) throw err;
            else return res.json(Response(constant.statusCode.ok, "Offer sent successfully", orderArr));
            // configs is now a map of JSON data
            // doSomethingWith(configs);
          }
        );
      } else {
        console.log("not array");
        // let contact_id_for_chat;
        // if (req.body.seller_id && req.body.bidder_id) {
        //   let data = {
        //     user_id1: req.body.seller_id,
        //     user_id2: req.body.bidder_id,
        //     status: true,
        //     created_at: `${moment().utc().format('YYYY-MM-DD')}`,
        //     updated_at: `${moment().utc().format('YYYY-MM-DD')}`
        //   };

        //   // const room_user = await common_query.findAllData(roomModel, rm_condition).catch(err => {
        //   //   throw err
        //   // })
        //   let inRoom = await bookshelf.knex.raw(`select
        //    "id" from rooms where ("user_id1"= '${req.body.seller_id}' and "user_id2"= '${req.body.bidder_id}') or
        //    ("user_id2"= '${req.body.seller_id}' and "user_id1"= '${req.body.bidder_id}');`);
        //   // console.log('offer_idoffer_id', req.body.offer_id)
        //   if (inRoom.rowCount) {
        //     console.log('2')
        //     let rmCondition = {
        //       id: inRoom.rows[0].id
        //     }

        //     console.log('5')

        //     const update_rm = {
        //       status: true,
        //       updated_at: `${moment().utc().format('YYYY-MM-DD')}`
        //     }
        //     await common_query.updateRecord(roomModel, update_rm, rmCondition).catch(err => {
        //       throw err
        //     })

        //     const contact_chat_condition = {
        //       room_id: inRoom.rows[0].id,
        //       my_id: req.body.seller_id,
        //       my_contact_id: req.body.bidder_id
        //     }
        //     console.log('data contact_chat_condition id in line number 312', contact_chat_condition)

        //     let contactInfo = await common_query.findAllData(contactModel,
        //       contact_chat_condition).catch(err => {
        //         throw err
        //       })
        //     console.log('data contact id in line number 317', contactInfo.data.toJSON())

        //     if ((contactInfo.data.toJSON()).length) {
        //       contactInfo = contactInfo.data.toJSON()
        //       contact_id_for_chat = contactInfo[0].id;
        //       console.log('data contact id in line number 318', contact_id_for_chat)
        //     } else {
        //       let data = {
        //         my_id: req.body.seller_id,
        //         my_contact_id: req.body.bidder_id,
        //         isblocked: false,
        //         created_at: `${moment().utc().format('YYYY-MM-DD')}`,
        //         updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
        //         room_id: inRoom.rows[0].id,
        //       };
        //       await common_query.saveRecord(contactModel, data).catch(err => {
        //         throw err
        //       }).then(async data => {
        //         console.log('datata in line number 335');
        //         const contact_chat_condition = {
        //           room_id: inRoom.rows[0].id,
        //           my_id: req.body.seller_id,
        //           my_contact_id: req.body.bidder_id
        //         }
        //         console.log('datata in line number 343', contact_chat_condition);

        //         let contactInfo = await common_query.findAllData(contactModel,
        //           contact_chat_condition).catch(err => {
        //             throw err
        //           })
        //         console.log('datata in line number 349', contactInfo.data);

        //         contactInfo = contactInfo.data.toJSON()
        //         contact_id_for_chat = contactInfo[0].id;
        //         console.log('data contact id in line number 348', contact_id_for_chat)
        //       });
        //     }
        //     // const chatData = {
        //     //   my_id: req.body.seller_id,
        //     //   room_id: parseInt(inRoom.rows[0].id),
        //     //   contact_id: req.body.bidder_id,
        //     //   message: { msg: '.' },
        //     //   type: 'text',
        //     //   date_to_group: `${moment().utc().format('YYYY-MM-DD')}`,
        //     //   created_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
        //     //   updated_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
        //     //   isdelete: false
        //     // }
        //     // let chatD = await common_query.saveRecord(chatModels, chatData)

        //   } else {
        //     console.log('datadatadatadata', data);
        //     let saveRoom = await common_query.saveRecord(roomModel, data).catch(err => {
        //       throw err
        //     });
        //     console.log('saveRoomsaveRoom', saveRoom.success.toJSON());
        //     let resp = saveRoom.success.toJSON()
        //     if (saveRoom) {
        //       let data = {
        //         my_id: req.body.seller_id,
        //         my_contact_id: req.body.bidder_id,
        //         isblocked: false,
        //         created_at: `${moment().utc().format('YYYY-MM-DD')}`,
        //         updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
        //         room_id: resp.id
        //       };
        //       let c2 = await common_query.saveRecord(contactModel, data).catch(err => {
        //         throw err
        //       }).then(async data => {
        //         console.log('datata in line number 335');
        //         const contact_chat_condition = {
        //           room_id: resp.id,
        //           my_id: req.body.seller_id,
        //           my_contact_id: req.body.bidder_id
        //         }

        //         let contactInfo = await common_query.findAllData(contactModel,
        //           contact_chat_condition).catch(err => {
        //             throw err
        //           })
        //         contactInfo = contactInfo.data.toJSON()
        //         contact_id_for_chat = contactInfo[0].id;
        //         console.log('data contact id in line number 348', contact_id_for_chat)
        //         // const chatData = {
        //         //   my_id: req.body.seller_id,
        //         //   room_id: parseInt(resp.id),
        //         //   contact_id: req.body.bidder_id,
        //         //   message: { msg: '.' },
        //         //   type: 'text',
        //         //   date_to_group: `${moment().utc().format('YYYY-MM-DD')}`,
        //         //   created_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
        //         //   updated_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
        //         //   isdelete: false
        //         // }
        //         // let chatD = await common_query.saveRecord(chatModels, chatData)
        //       });
        //       let data1 = {
        //         my_contact_id: req.body.seller_id,
        //         my_id: req.body.bidder_id,
        //         isblocked: false,
        //         created_at: `${moment().utc().format('YYYY-MM-DD')}`,
        //         updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
        //         room_id: resp.id
        //       };
        //       let c1 = await common_query.saveRecord(contactModel, data1).catch(err => {
        //         throw err
        //       });

        //     }
        //   }

        // }
        transaction_number = randomize("A", 2);
        var val = Math.floor(1000 + Math.random() * 9000);
        transaction_number = transaction_number + val.toString();
        const {
          bid_and_ask_id,
          bidder_id,
          expiry_date,
          expiry_day,
          note,
          payment_method,
          payment_time,
          product_id,
          seller_id,
          type_of,
          type_of_offer,
          is_deleted,
          amount,
          qty,
          type,
        } = req.body;
        let data = {
          bid_and_ask_id,
          bidder_id,
          expiry_day,
          note,
          payment_method,
          payment_time,
          product_id,
          seller_id,
          type_of,
          type_of_offer,
          is_deleted,
          qty,
          amount,
          type,
          is_private,
          transaction_number,
        };

        var expiredAt = moment()
          .utc()
          .add(expiry_day * 24, "hours")
          .format();
        var createdAt = `${moment().utc().format("YYYY-MM-DD")}`;
        data.expiry_date = expiredAt;
        data.created_at = createdAt;
        data.total_amount = qty * amount;
        console.log("data in counter offer is!!!!!!!!!!!!!!!!!!", data);
        const counterDataSaved = await common_query.saveRecord(CounterModel, data);
        console.log("counterData!!!!!!!!!!!!!!!!!!!!!", counterDataSaved.success.toJSON());

        if (data.type_of == "ask") {
          var notObj = {
            created_by: data.bidder_id,
            content: "sent you an offer",
            destnation_user_id: data.seller_id,
          };
        } else {
          var notObj = {
            created_by: data.seller_id,
            content: "sent you an offer",
            destnation_user_id: data.bidder_id,
          };
        }

        utility.addNotification(notObj, function (err, resp) {
          if (err) {
            console.log("Error adding notification in counter offer", err);
          } else {
            console.log("response after calling common add notification in counter offer", resp);
          }
        });
        let updateCheckoutdata = {
          isCheckout: true,
          updatedAt: `${moment().utc().format("YYYY-MM-DD")}`,
        };
        let conditionForCheckout = {
          user_id: parseInt(seller_id),
          bidask_id: parseInt(bid_and_ask_id),
        };
        let respMsg =
          req.body.type_of_offer == "Accept" ? "Offer accepted Successfully" : "Counter Offer sent successfully";
        // console.log('updateCheckoutdata', conditionForCheckout)
        // const findDatainCart = await common_query.findAllData(cartModel, conditionForCheckout).catch(err => {
        //   throw err
        // })
        // if (findDatainCart.data.length) {
        //   await common_query.updateRecord(cartModel, updateCheckoutdata, conditionForCheckout).catch(err => {
        //     throw err
        //   })
        // }
        console.log("counterData&&&&&&&&&&&&&&&&&&", counterDataSaved.success.toJSON());
        if (counterDataSaved.code == 200) {
          return res.json(Response(constant.statusCode.ok, respMsg, counterDataSaved));
        } else if (counterData.code == 409) {
          return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
        }
      }
    } catch (err) {
      console.log("erorrrrrr", err);
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError));
    }
  }
  createCounter().then((res) => {});
}

function getPopularProduct(req, res) {
  async function getPopularProduct() {
    try {
      let condition = ` select P.*, i."imageUrl", count(t.*) as total, 
MIN(CASE WHEN t.request='asks' and t.type='Box' THEN t.amount END) as BoxLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Box' THEN t.amount END) as BoxHighestBid,
MIN(CASE WHEN t.request='asks' and t.type='Case' THEN t.amount END) as CaseLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Case' THEN t.amount END) as CaseHighestBid
from products P
LEFT OUTER JOIN bid_and_ask t on p.id = t."productId"
LEFT OUTER JOIN images i on P.id = i."productId"
where t."createdAt" >= (DATE(NOW()) - INTERVAL '30 days') 
group by P.id, i."imageUrl" order by P."productName" limit 12
        ;`;

      let popularList = await bookshelf.knex.raw(condition);
      // if (popularList.rows.length > 0) {
      return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, popularList));
      // } else {
      //   return res.json(
      //     Response(
      //       constant.statusCode.notFound,
      //       constant.validateMsg.noRecordFound
      //     )
      //   );
      // }
    } catch (err) {
      console.log("error in getPopularProduct");
    }
  }

  getPopularProduct().then((res) => {});
}

function editProduct(req, res) {
  async function editProductMethod() {
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    var newdate = year + "-" + month + "-" + day;

    let updatedata = {
      productName: req.body.productName ? req.body.productName : null,
      releaseDate: req.body.releaseDate ? req.body.releaseDate : null,
      categoryId: req.body.category_id ? req.body.category_id : null,
      subcategoryId: req.body.subcategory_id ? req.body.subcategory_id : null,
    };
    let condition = {
      id: req.body.id,
    };

    let updateUserData = await common_query.updateRecord(ProductModel, updatedata, condition);
    if (updateUserData.code == 200) {
      saveCategoryMapping(req, res);
      let timeStamp = JSON.stringify(Date.now());
      let db_path = "";
      let path = "";
      let extension;
      mkdirp(config.ARTICLEIMAGE).then(async function (data, err) {
        if (err) {
          return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, err));
        } else {
          if (req.files) {
            extension = req.files.file.name.split(".");
            let imgOriginalName = req.files.file.name;
            path = config.PRODUCTIMAGE + timeStamp + "_" + imgOriginalName;
            console.log("path---->", req.body);
            db_path = timeStamp + "_" + imgOriginalName;
            if (path != "") {
              let extensionArray = ["jpg", "jpeg", "png", "jfif"];
              let format = extension[extension.length - 1];
              if (extensionArray.includes(format)) {
                // const result = await common_query.fileUpload(path, (req.files.file.data));
                const result = await s3file_upload.uploadProductImage(req.files.file.data, db_path);
                var updata = {
                  productId: req.body.id,
                  imageUrl: result.url,
                  updatedAt: newdate,
                  updatedById: req.user._id,
                };
                let cond = {
                  id: req.body.imageId,
                };
                if (req.body.imageId == "null") {
                  const updateImage = await common_query.saveRecord(imageModel, {
                    productId: req.body.id,
                    imageUrl: result.url,
                    imageId: uuidv4(),
                    updatedAt: newdate,
                    createdAt: newdate,
                    createdById: req.user._id,
                  });
                  if (updateImage.code == 200) {
                    return res.json(
                      Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, updateImage)
                    );
                  } else {
                    console.log("updateImage error");
                    return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
                  }
                } else {
                  const updateImage = await common_query.updateRecord(imageModel, updata, cond);
                  if (updateImage.code == 200) {
                    return res.json(
                      Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, updateImage)
                    );
                  } else {
                    console.log("updateImage error");
                    return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
                  }
                }
              } else {
                return res.json(Response(constant.statusCode.unauth, constant.validateMsg.notSupportedType));
              }
            }
          }
        }
      });
    } else {
      return res.json(
        Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body)
      );
    }
  }
  editProductMethod().then((data) => {});
}

function saveProduct(req, res) {
  async function saveProductMethod() {
    try {
      const { productName, releaseDate, category_id, subcategory_name } = req.body;
      let isDuplictate = false;
      let condition = `select * from products where "productName" iLike '${productName}' and "categoryId" = '${category_id}' and "subcategoryId" = '${subcategory_name}' and "isdeleted"=false;`;
      let checkDuplicate = await bookshelf.knex.raw(condition);
      if (checkDuplicate.rowCount > 0) {
        isDuplictate = true;
        return res.json(
          Response(
            constant.statusCode.alreadyExist,
            "Product Name is already present with the given category and sub-category"
          )
        );
      }
      if (!isDuplictate) {
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        // console.log('releaseDate', releaseDate)
        var reqReleaseDate = `${moment(new Date(releaseDate)).utc().format("YYYY-MM-DD")}`;
        // console.log('reqReleaseDate', reqReleaseDate)

        // var reqReleaseDate = ''
        newdate = year + "-" + month + "-" + day;
        let data = {
          productName: productName ? productName : null,
          createdById: req.user._id,
          createdAt: newdate ? newdate : null,
          categoryId: category_id ? category_id : null,
          releaseDate: reqReleaseDate ? reqReleaseDate : null,
          isdeleted: false,
          subcategoryId: req.body.subcategory_name ? req.body.subcategory_name : null,
          product_id: uuidv4(),
        };
        let savePrtoductData = await common_query.saveRecord(ProductModel, data);
        if (savePrtoductData.code == 200) {
          saveCategoryMapping(req, res);
          let timeStamp = JSON.stringify(Date.now());
          let db_path = "";
          let path = "";
          let extension;
          mkdirp(config.ARTICLEIMAGE).then(async function (data, err) {
            if (err) {
              return res.json(
                Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, err)
              );
            } else {
              if (req.body) {
                extension = req.files.file.name.split(".");
                let imgOriginalName = req.files.file.name;
                path = config.PRODUCTIMAGE + timeStamp + "_" + imgOriginalName;
                db_path = timeStamp + "_" + imgOriginalName;
                let s3filename = timeStamp + "_" + extension[0] + ".jpg";
                // if (path != '') {
                let extensionArray = ["jpg", "jpeg", "png", "jfif"];
                let format = extension[extension.length - 1];
                // if (extensionArray.includes(format)) {
                // const result = await common_query.fileUpload(path, (req.files.file.data));
                const s3Upload = await s3file_upload
                  .uploadProductImage(req.files.file.data, s3filename)
                  .catch((err) => {
                    throw err;
                  });

                console.log("s3Upload", s3Upload);
                const imgData = {
                  productId: savePrtoductData.success.id,
                  imageUrl: s3Upload.url,
                  imageId: uuidv4(),
                  updatedAt: newdate,
                  createdAt: newdate,
                  createdById: req.user._id,
                };
                const updateImage = await common_query.saveRecord(imageModel, imgData);
                if (updateImage.code == 200) {
                  // return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, updateImage));
                  return res.json(Response(constant.statusCode.ok, constant.messages.Addproduct, savePrtoductData));
                } else {
                  console.log("updateImage error");
                  return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
                }
                //
                // else {
                //   return res.json(Response(constant.statusCode.unauth, constant.validateMsg.notSupportedType));
                // }
                // }
              }
            }
          });
          // return res.json(Response(constant.statusCode.ok, constant.messages.Addproduct, savePrtoductData));
        } else if (savePrtoductData.code == 409) {
          return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
        }
      }
    } catch (err) {}
  }
  saveProductMethod().then((data) => {});
}

function bulkUpload(req, res) {
  async function bulkUploadMethod() {
    console.log("req.files:::::::::::::::::::::::", req.files);
    if (req.files) {
      let timeStamp = JSON.stringify(Date.now());
      extension = req.files.csvfile.name.split(".");
      let csvOriginalName = req.files.csvfile.name;
      db_path = timeStamp + "_" + csvOriginalName;

      let result_s3 = await s3file_upload.uploadBulkUploadImage(req.files.csvfile.data, db_path);
      console.log("resultresultresultresultresult::::::::::::::::::", result_s3);
      let streamData;
      let arrStreamData = [];
      let extensionArray = ["csv"];
      let format = extension[extension.length - 1];
      if (extensionArray.includes(format)) {
        // const result = await common_query.fileUpload(path, (req.files.csvfile.data));
        if (result_s3.url) {
          let duplicateRecord = 0;
          let totalRecord = 0;
          let countData = 0;
          let norecordFound = 0;
          let fail = 0;
          let params = {
            Bucket: result_s3.bucket,
            Key: result_s3.key,
          };

          // let file= fs.crea
          s3.getObject(params)
            .createReadStream(result_s3.url)
            .pipe(csv())
            .on("data", async (data) => {
              countData++;
              console.log("sream data is", data);
              streamData = data;
              arrStreamData.push(streamData);
              const condition1 = {
                id: data.Product_No,
              };
              // console.log('condition1', condition1)
              // return true
              const productExist = await common_query.findAllData(ProductModel, condition1).catch((err) => {
                throw err;
              });

              console.log("product exists:::::", productExist.data.toJSON());

              let productData_exist = productExist.data.toJSON();
              if (productData_exist.length && productData_exist[0].productName) {
                const findCat = await common_query.findAllData(categoryModel, {
                  categoryName: data.Category,
                });
                const findSubCat = await common_query.findAllData(subcategoryModel, {
                  subcategory_name: data.SubCategory,
                });
                let findCatJson = findCat.data.toJSON();
                let findSubCatJson = findSubCat.data.toJSON();
                if (findCatJson.length && findSubCatJson.length) {
                  let isDuplictate = false;
                  let catobj = {};
                  let subcatobj = {};
                  let categoryData = await bookshelf.knex.raw(
                    `select "categoryName", "id" from category where isdeleted=false;`
                  );
                  let subcategoryData = await bookshelf.knex.raw(
                    `select "subcategory_name", "id" from subcategory where isdeleted=false;`
                  );

                  // console.log('categoryData',categoryData)
                  // console.log('subcategoryData',subcategoryData)

                  categoryData.rows.forEach((row) => {
                    catobj[row.categoryName] = row.id;
                  });

                  subcategoryData.rows.forEach((row) => {
                    subcatobj[row.subcategory_name] = row.id;
                  });
                  console.log("${catobj[data.Category]}", `${catobj[data.Category]}`);

                  let condition = `select * from products where "productName" iLike '${data.Product_Name}'
                   and "categoryId" = '${catobj[data.Category]}' 
                   and "subcategoryId" = '${subcatobj[data.SubCategory]}' and "isdeleted"=false;`;
                  let checkDuplicate = await bookshelf.knex.raw(condition);

                  if (checkDuplicate.rowCount > 0) {
                    isDuplictate = true;
                    duplicateRecord++;
                    console.log("duplicate in if 1st", duplicateRecord);
                  } else {
                    var dateObj = new Date();
                    var month = dateObj.getUTCMonth() + 1; //months from 1-12
                    var day = dateObj.getUTCDate();
                    var year = dateObj.getUTCFullYear();

                    var reqReleaseDate = `${moment(data.ReleaseDate).utc().format("YYYY-MM-DD")}`;

                    newdate = year + "-" + month + "-" + day;

                    let data2 = {
                      productName: data.Product_Name ? data.Product_Name : null,
                      createdById: req.user._id,
                      createdAt: newdate ? newdate : null,
                      categoryId: catobj ? catobj[data.Category] : null,
                      releaseDate: reqReleaseDate ? reqReleaseDate : null,
                      isdeleted: false,
                      subcategoryId: subcatobj ? subcatobj[data.SubCategory] : null,
                      product_id: uuidv4(),
                    };
                    // console.log(data);return;
                    const pCondiiton = {
                      id: data.Product_No,
                    };
                    let savePrtoductData = {
                      code: 409,
                    };
                    if (data && data.isUpdated != "0") {
                      savePrtoductData = await common_query.updateRecord(ProductModel, data2, pCondiiton);
                    }

                    console.log("save record status", savePrtoductData.code);

                    if (savePrtoductData.code == 200) {
                      req.body.category_id = catobj[data.Category];
                      req.body.subcategory_id = subcatobj[data.SubCategory];
                      saveCategoryMapping(req, res);
                      totalRecord++;
                      console.log("total recorddata on save product data 123", totalRecord);

                      console.log("total record 2nd 123", totalRecord);
                    } else if (savePrtoductData.code == 409) {
                      duplicateRecord++;
                      fail++;
                      console.log("duplicate record 3rd", duplicateRecord, fail);
                    }
                  }
                } else {
                  norecordFound++;
                }
              } else {
                const findCat1 = await common_query.findAllData(categoryModel, {
                  categoryName: data.Category,
                });

                const findSubCat1 = await common_query.findAllData(subcategoryModel, {
                  subcategory_name: data.SubCategory,
                });

                let findCatJson1 = findCat1.data.toJSON();
                let findSubCatJson1 = findSubCat1.data.toJSON();

                if (findCatJson1.length && findSubCatJson1.length) {
                  let isDuplictate = false;
                  let catobj = {};
                  let subcatobj = {};
                  let categoryData = await bookshelf.knex.raw(
                    `select "categoryName", "id" from category where isdeleted=false;`
                  );
                  let subcategoryData = await bookshelf.knex.raw(
                    `select "subcategory_name", "id" from subcategory where isdeleted=false;`
                  );

                  categoryData.rows.forEach((row) => {
                    catobj[row.categoryName] = row.id;
                  });

                  subcategoryData.rows.forEach((row) => {
                    subcatobj[row.subcategory_name] = row.id;
                  });
                  console.log("${catobj[data.Category]}", `${catobj[data.Category]}`);

                  let condition = `select * from products where "productName" iLike '${data.Product_Name}'
                   and "categoryId" = '${catobj[data.Category]}' 
                   and "subcategoryId" = '${subcatobj[data.SubCategory]}' and "isdeleted"=false;`;
                  let checkDuplicate = await bookshelf.knex.raw(condition);

                  if (checkDuplicate.rowCount > 0) {
                    isDuplictate = true;
                    duplicateRecord++;
                    console.log("duplicate in if 1st", duplicateRecord);
                  } else {
                    var dateObj = new Date();
                    var month = dateObj.getUTCMonth() + 1; //months from 1-12
                    var day = dateObj.getUTCDate();
                    var year = dateObj.getUTCFullYear();

                    var reqReleaseDate = `${moment(data.ReleaseDate).utc().format("YYYY-MM-DD")}`;

                    newdate = year + "-" + month + "-" + day;

                    let data2 = {
                      productName: data.Product_Name ? data.Product_Name : null,
                      createdById: req.user._id,
                      createdAt: newdate ? newdate : null,
                      categoryId: catobj ? catobj[data.Category] : null,
                      releaseDate: reqReleaseDate ? reqReleaseDate : null,
                      isdeleted: false,
                      subcategoryId: subcatobj ? subcatobj[data.SubCategory] : null,
                      product_id: uuidv4(),
                    };
                    // console.log(data);return;
                    let savePrtoductData = await common_query.saveRecord(ProductModel, data2);
                    console.log("save record status", savePrtoductData.code);

                    if (savePrtoductData.code == 200) {
                      req.body.category_id = catobj[data.Category];
                      req.body.subcategory_id = subcatobj[data.SubCategory];
                      saveCategoryMapping(req, res);
                      totalRecord++;
                      console.log("total recorddata on save product data", totalRecord);

                      console.log("total record 2nd", totalRecord);
                    } else if (savePrtoductData.code == 409) {
                      duplicateRecord++;
                      fail++;
                      console.log("duplicate record 3rd", duplicateRecord, fail);
                    }
                  }
                  console.log("countDatacountDatacountData", countData);
                  console.log("totalRecordtotalRecord", totalRecord);
                  console.log("duplicateRecordduplicateRecord", duplicateRecord);
                } else {
                  norecordFound++;
                }
              }
              if (countData == totalRecord + duplicateRecord + norecordFound) {
                console.log("ops end here now", countData, totalRecord, duplicateRecord, norecordFound);
                result_s3["totalRecord"] = totalRecord;
                result_s3["duplicateRecord"] = duplicateRecord;
                return res.json(Response(constant.statusCode.ok, constant.messages.bulkUploadSuccessfully, result_s3));
              }
            })
            .on("end", () => {
              console.log(result_s3.url, "end on call");

              // return res.json(Response(constant.statusCode.ok, constant.messages.bulkUploadSuccessfully, result));
            })
            .on("finish", () => {
              console.log("streamdatatatatataat", arrStreamData);

              console.log("rstream finish");
            })
            .on("close", () => {
              console.log("rstream close");
            });

          // console.log("totalRecord------------>", arrStreamData);
          //  console.log("duplicateRecord------------>",duplicateRecord);
          //  console.log("result in bulkupload is",result)
        } else {
          console.log("updateCSV error");
          return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
        }
      } else {
        return res.json(Response(constant.statusCode.alreadyExist, "Invalid format"));
      }
    }

    //   console.log(config.BULKUPLOADPATH+'/b2b_sample.csv');
  }
  bulkUploadMethod().then((data) => {});
}

// function bulkUpload(req, res) {
//   async function bulkUploadMethod() {

//     if (req.files) {
//       let timeStamp = JSON.stringify(Date.now());
//       extension = req.files.csvfile.name.split(".");
//       let csvOriginalName = req.files.csvfile.name;
//       path = config.BULKUPLOADPATH + timeStamp + "_" + csvOriginalName;
//       db_path = timeStamp + "_" + csvOriginalName;

//       let result_s3 = await s3file_upload.uploadBulkUploadImage((req.files.csvfile.data), db_path);
//       console.log('resultresultresultresultresult', result_s3)

//       if (path != '') {
//         let extensionArray = ["csv"];
//         let format = extension[extension.length - 1];
//         if (extensionArray.includes(format)) {
//           // const result = await common_query.fileUpload(path, (req.files.csvfile.data));
//           if (result_s3.url) {
//             let duplicateRecord = 0;
//             let totalRecord = 0;
//             let countData = 0
//             let params = {
//               Bucket: result_s3.bucket,
//               Key: result_s3.key
//             }

//             // let file= fs.crea
//             s3.getObject(params)
//               .createReadStream(result_s3.url)
//               .pipe(csv())
//               .on('data', async (data) => {
//                 countData++
//                 console.log('sream data is', data)
//                 let isDuplictate = false;
//                 let catobj = {};
//                 let subcatobj = {};

//                 let categoryData = await bookshelf.knex.raw(`select "categoryName", "id" from category where isdeleted=false;`);
//                 let subcategoryData = await bookshelf.knex.raw(`select "subcategory_name", "id" from subcategory where isdeleted=false;`);
//                 categoryData.rows.forEach(row => {

//                   catobj[row.categoryName] = row.id;
//                 });

//                 subcategoryData.rows.forEach(row => {
//                   subcatobj[row.subcategory_name] = row.id;
//                 });

//                 let condition = `select * from products where "productName" iLike '${data.ProductName}' and "categoryId" = '${catobj[data.Category]}' and "subcategoryId" = '${subcatobj[data.SubCategory]}' and "isdeleted"=false;`
//                 let checkDuplicate = await bookshelf.knex.raw(condition);

//                 if (checkDuplicate.rowCount > 0) {
//                   isDuplictate = true;
//                   duplicateRecord++;
//                   console.log('duplicate in if 1st', duplicateRecord)
//                 } else {
//                   var dateObj = new Date();
//                   var month = dateObj.getUTCMonth() + 1; //months from 1-12
//                   var day = dateObj.getUTCDate();
//                   var year = dateObj.getUTCFullYear();

//                   var reqReleaseDate = `${moment(data.ReleaseDate).utc().format('YYYY-MM-DD')}`;

//                   newdate = year + "-" + month + "-" + day;

//                   let data2 = {
//                     productName: data.ProductName ? data.ProductName : null,
//                     createdById: req.user._id,
//                     createdAt: newdate ? newdate : null,
//                     categoryId: catobj ? catobj[data.Category] : null,
//                     releaseDate: reqReleaseDate ? reqReleaseDate : null,
//                     isdeleted: false,
//                     subcategoryId: subcatobj ? subcatobj[data.SubCategory] : null,
//                     product_id: uuidv4()
//                   }
//                   // console.log(data);return;
//                   let savePrtoductData = await common_query.saveRecord(ProductModel, data2);
//                   console.log('save record status', savePrtoductData)

//                   if (savePrtoductData.code == 200) {
//                     req.body.category_id = catobj[data.Category];
//                     req.body.subcategory_id = subcatobj[data.SubCategory];
//                     saveCategoryMapping(req, res);
//                     totalRecord++;

//                     console.log('total record 2nd', totalRecord)
//                   } else if (savePrtoductData.code == 409) {
//                     duplicateRecord++;
//                     fail++;
//                     console.log('duplicate record 3rd', duplicateRecord, fail)
//                   }

//                 }
//                 if (countData == totalRecord + duplicateRecord) {
//                   console.log('ops end here now', countData, totalRecord, duplicateRecord)
//                   result_s3['totalRecord'] = totalRecord;
//                   result_s3['duplicateRecord'] = duplicateRecord;
//                   return res.json(Response(constant.statusCode.ok, constant.messages.bulkUploadSuccessfully, result_s3));
//                 }
//               })
//               .on('end', () => {
//                 console.log(result_s3.url, 'end on call');

//                 // return res.json(Response(constant.statusCode.ok, constant.messages.bulkUploadSuccessfully, result));
//               })
//               .on('finish', () => { console.log('rstream finish'); })
//               .on('close', () => { console.log('rstream close'); })

//             // console.log("totalRecord------------>",totalRecord);
//             // console.log("duplicateRecord------------>",duplicateRecord);
//             // console.log("result in bulkupload is",result)

//           } else {
//             console.log("updateCSV error");
//             return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
//           }
//         } else {
//           return res.json(Response(constant.statusCode.alreadyExist, 'Invalid format'));
//         }
//       }

//     }

//     // console.log(config.BULKUPLOADPATH+'/b2b_sample.csv');

//   }
//   bulkUploadMethod().then((data) => { })
// }

function category() {
  return new Promise((resolve, reject) => {
    let categoryData = bookshelf.knex.raw(`select
    "categoryName", "id" from category where isdeleted=false;`);
    resolve(categoryData);
  });
}
function subcategory1() {
  return new Promise((resolve, reject) => {
    let subcategory = bookshelf.knex.raw(`select 
"subcategory_name", "id" from subcategory where isdeleted=false;`);
    resolve(subcategory);
  });
}
// function saveProduct(req, res) {
//   async function saveProductMethod() {
//     console.log(req.body)
//     const {
//       productName,
//       releaseDate,
//       category_id
//     } = req.body;
//     var dateObj = new Date();
//     var month = dateObj.getUTCMonth() + 1; //months from 1-12
//     var day = dateObj.getUTCDate();
//     var year = dateObj.getUTCFullYear();

//     var reqReleaseDate=`${moment(releaseDate).utc().format('YYYY-MM-DD')}`;
//     console.log("req date======>",reqReleaseDate)

//     newdate = year + "-" + month + "-" + day;
//     let data = {
//       productName: productName ? productName : null,
//       createdById: req.user._id,
//       createdAt: newdate ? newdate : null,
//       categoryId: category_id ? category_id : null,
//       releaseDate: reqReleaseDate ? reqReleaseDate : null,
//       isdeleted:false,
//       product_id: uuidv4()
//     }
//     let savePrtoductData = await common_query.saveRecord(ProductModel, data);
//     if (savePrtoductData.code == 200) {
//       let timeStamp = JSON.stringify(Date.now());
//       let db_path = '';
//       let path = '';
//       let extension;
//       mkdirp(config.ARTICLEIMAGE).then(async function (data, err) {
//         if (err) {
//           return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, err));
//         } else {
//           if (req.body) {
//             extension = req.files.file.name.split(".");
//             let imgOriginalName = req.files.file.name;
//             path = config.PRODUCTIMAGE + timeStamp + "_" + imgOriginalName;
//             db_path = timeStamp + "_" + imgOriginalName;
//             if (path != '') {
//               let extensionArray = ["jpg", "jpeg", "png", "jfif"];
//               let format = extension[extension.length - 1];
//               if (extensionArray.includes(format)) {
//                 const result = await common_query.fileUpload(path, (req.files.file.data));
//                 const updateImage = await common_query.saveRecord(imageModel, { productId: savePrtoductData.success.id, imageUrl: db_path, imageId: uuidv4() })
//                 if (updateImage.code == 200) {
//                   console.log("updateImage 200", updateImage);
//                   return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, updateImage));

//                 } else {
//                   console.log("updateImage error", updateImage);
//                   return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));

//                 }
//               }
//               else {
//                 return res.json(Response(constant.statusCode.unauth, constant.validateMsg.notSupportedType));
//               }
//             }
//           }
//         }
//       })
//       return res.json(Response(constant.statusCode.ok, constant.messages.Addproduct, savePrtoductData));
//     } else if (savePrtoductData.code == 409) {

//       return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
//     }
//   }
//   saveProductMethod().then((data) => {
//   })
// }

function getProductDetails(req, res) {
  async function getProductDetailsMethod() {
    //console.log(req.body);
    const { producr_id } = req.body;
    let condition = {
      producr_id: producr_id,
    };
    let getProductDetails = await common_query.findAllData(ProductModel, condition);
    //   console.log(saveUserData);
    if (getProductDetails.code == 200) {
      return res.json(
        Response(constant.statusCode.ok, constant.messages.productDetailsFetchedSuccessfully, getProductDetails)
      );
    } else if (getProductDetails.code == 409) {
      return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
    }
  }
  getProductDetailsMethod().then((data) => {});
}

function getProduct(req, res) {
  async function getProductMethod() {
    try {
      let sql = ` SELECT P.*, I."imageUrl",I."id" as imageId, C."categoryName",  S."subcategory_name", count(*) OVER() AS full_count FROM products P 
      LEFT OUTER JOIN images I on P.id = I."productId"
      LEFT OUTER JOIN category C on C.id = P."categoryId"
      LEFT OUTER JOIN subcategory S on S.id = P."subcategoryId"
      WHERE P.id=${req.params.id} AND P.isdeleted=false;`;
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
  getProductMethod().then((data) => {});
}

function getAllProducts(req, res) {
  async function getAllProductsMethod() {
    try {
      let limit = req.body.pagePerLimit || 10;
      let page = req.body.currentPage - 1 || 0;
      let isdeleted = req.body.isdeleted || false;
      let offset = limit * page;
      let searchChar, orderQuery;
      if (req.body.searchChar) {
        searchChar = `(P."productName" ilike 
        '%${req.body.searchChar}%' OR C."categoryName" 
        ilike '%${req.body.searchChar}%' OR CAST(S."subcategory_name" as TEXT) 
        LIKE '%${req.body.searchChar}%') and `;
      }

      let columnName = req.body.columnName || "productName";
      let sortingOrder = req.body.sortingOrder || "ASC";
      if (req.body.columnName == "categoryName") {
        orderQuery = `C."categoryName"`;
      } else if (req.body.columnName == "subcategoryName") {
        orderQuery = `S."subcategory_name"`;
      } else {
        orderQuery = `P."${columnName}"`;
      }

      let sql = ` SELECT P.*,
      I."imageUrl",I."id" as imageId, C."categoryName", 
      S."subcategory_name", count(*) OVER() AS full_count FROM products P 
      LEFT OUTER JOIN images I on P.id = I."productId"
      LEFT OUTER JOIN category C on C.id = P."categoryId"
      LEFT OUTER JOIN subcategory S on S.id = P."subcategoryId"
      WHERE ${searchChar ? searchChar : ""} 
      P.isdeleted=? ORDER BY ${orderQuery ? orderQuery : ""} ${sortingOrder} OFFSET ? LIMIT ?`;
      bookshelf.knex
        .raw(sql, [isdeleted, offset, limit])
        .then((data) => {
          return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
        })
        .catch((err) => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getAllProductsMethod().then((data) => {});
}

function getAllProductsByCategorys(req, res) {
  async function getAllProductsByCategorysMethod() {
    let { category_id } = req.body;
    let productList = await common_query.findAllData(ProductModel, {
      category_id: category_id,
    });
    if (productList.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, productList));
    } else if (productList.code == 409) {
      return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
    }
  }
  getAllProductsByCategorysMethod().then((data) => {});
}

function getAllCategorysYears(req, res) {
  async function getAllCategorysYearsMethod() {
    //console.log(req.body);

    var sql = `SELECT DISTINCT "years" FROM (SELECT EXTRACT(YEAR FROM "releaseDate")FROM products WHERE("categoryId"=?)) AS years;
`;
    var raw = bookshelf.knex.raw(sql, [req.body.category_id]);
    raw
      .then(function (icd) {
        let array1 = icd.rows;

        var years = [];
        array1.forEach((element) => {
          let output = JSON.stringify(element);
          let output1 = JSON.parse(output);
          years.push(output1.years.match(/\(([^)]+)\)/)[1]);
        });
        console.log("res", years);
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, years));
      })
      .catch(function (err) {
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getAllCategorysYearsMethod().then(function (params) {});
}

// function getAllproductByYears(req, res) {
//   async function getAllproductByYearsMethod() {
//     console.log(req.body);
//     var product;
//     // var sql = `SELECT products.*, images."imageUrl"
//     //            FROM products
//     //            LEFT JOIN images ON products.id=images."productId"
//     //            WHERE ("categoryId"=? AND (SELECT EXTRACT(YEAR FROM "releaseDate")=?));`;

//     var createtemptable1 = `INSERT INTO tblmax("HighestBid","productId")
//  SELECT MAX(BAA.amount) AS HighestBid, BAA."productId"
//  FROM   bid_and_ask BAA
// GROUP BY BAA."request",BAA."productId",BAA."type"
// HAVING (BAA."request" = 'bids' AND BAA."type"='box');`;

//     var raw = bookshelf.knex.raw(createtemptable1, []);
//     //  var raw2 = bookshelf.knex.raw(createtemptable1, [req.body.category_id,req.body.releaseDate]);
//     raw.then(function (result) {
//       console.log(JSON.stringify(result))
//       var createtemptable2 = `INSERT INTO tblmin("LowestAsk","productId")	SELECT MIN(BAA.amount) AS LowestAsk, BAA."productId"
//         FROM   bid_and_ask BAA
// 		GROUP BY BAA."request",BAA."productId",BAA."type" HAVING (BAA."request" = 'asks' AND BAA."type"='box')`;

//       var raw1 = bookshelf.knex.raw(createtemptable2, []);
//       raw1.then(function (result) {

//         var sql = `SELECT products.*, images."imageUrl",tblmin."LowestAsk",tblmax."HighestBid"
//   FROM products
//   LEFT JOIN images ON products.id=images."productId"
//   LEFT JOIN tblmin ON products.id=tblmin."productId"
//   LEFT JOIN tblmax ON products.id=tblmax."productId"
//   WHERE ("categoryId"=? AND (SELECT EXTRACT(YEAR FROM "releaseDate")=?));`

//         var raw2 = bookshelf.knex.raw(sql, [req.body.category_id, req.body.releaseDate]);
//         raw2.then(function (result) {
//           product = result;
//           var deletetblmin = bookshelf.knex.raw(`DELETE FROM tblmin`, []);
//           deletetblmin.then(function (result) {
//             var deletetblmax = bookshelf.knex.raw(`DELETE FROM tblmax`, []);
//             deletetblmax.then(function (result) {
//               console.log("result===>", result);
//               return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, product));
//             })
//           })
//         }).catch(function (err) {
//           console.log(err)
//           return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
//         });

//       })
//     })

//     // var raw = bookshelf.knex.raw(sql, [req.body.category_id, req.body.releaseDate]);
//     // raw
//     //   .then(function (result) {

//     //     let array1 = result.rows;
//     //     console.log(result.rows)
//     //     var products = [];
//     //     array1.forEach(element => {
//     //       let output = JSON.stringify(element);
//     //       let output1 = JSON.parse(output);
//     //       products.push(output1);
//     //     }
//     //     );
//     //     console.log("res", products);
//     //     return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, products));
//     //   }).catch(function (err) {
//     //     return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
//     //   });

//   }
//   getAllproductByYearsMethod().then(function (params) { });

// }

function deleteProduct(req, res) {
  async function deleteProductMethod() {
    //console.log(req.bodegistey);
    let updatedata = {
      isdeleted: true,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(ProductModel, updatedata, condition);
    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.DeleteSuccess, updateUserData));
    } else {
      return res.json(
        Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body)
      );
    }
  }
  deleteProductMethod().then((data) => {});
}

function updateProductImage(req, res) {
  async function updateProductImageMethod() {
    let timeStamp = JSON.stringify(Date.now());
    let { producr_id } = req.body;
    let db_path = "";
    let path = "";
    let extension;
    mkdirp(config.ARTICLEIMAGE).then(async function (data, err) {
      if (err) {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, err));
      } else {
        if (req.body) {
          extension = req.files.file.name.split(".");
          let imgOriginalName = req.files.file.name;
          path = config.PRODUCTIMAGE + timeStamp + "_" + imgOriginalName;
          db_path = timeStamp + "_" + imgOriginalName;
          if (path != "") {
            let extensionArray = ["jpg", "jpeg", "png", "jfif"];
            let format = extension[extension.length - 1];
            if (extensionArray.includes(format)) {
              const result = await common_query.fileUpload(path, req.files.file.data);
              const updateImage = await common_query.updateRecord(
                imageModel,
                { imageUrl: db_path },
                { productId: producr_id }
              );
            } else {
              return res.json(Response(constant.statusCode.unauth, constant.validateMsg.notSupportedType));
            }
          }
        }
      }
    });
    return res.json(Response(constant.statusCode.ok, constant.messages.Addproduct, savePrtoductData));
  }
  updateProductImageMethod().then(function (params) {});
}

function getAllCategorysYearstest(req, res, next) {
  console.log("in method");
  async function userdetailsMethod() {
    // var pageSize, limit, offset
    // let options = santize.escape(req.body.params);
    // if (options.page) {
    //   offset = options.limit * (options.page - 1);
    // }
    // limit = options.limit ? options.limit : config.PAGINATION.LIMIT;
    var conditions = {};
    new ProductModel()
      .where(conditions)
      .query(_filter)
      .query(function (qb) {
        qb.columns(["products.*", "images.imageUrl", "bid_and_ask.amount"]);
      })
      .fetchAll()
      .then(function (getDraftListResult) {
        getDraftListResult = getDraftListResult.toJSON();
        //console.log(getDraftListResult)
        return res.json(Response(constant.statusCode.ok, constant.messages.loginSuccess, getDraftListResult));
      })
      .catch(function (err) {
        console.log(err);
        __debug(err);
        return res.json({
          status: config.statusCode.error,
          data: [],
          message: i18n.__("INTERNAL_ERROR"),
        });
      });
    function _filter(qb) {
      qb.joinRaw(`LEFT JOIN images ON (products.id = images."productId")`);
      qb.joinRaw(`LEFT JOIN bid_and_ask ON (products.id = bid_and_ask."productId")`);
      //qb.whereRaw(' bid_and_ask.request = ?',['bids'])
      // qb.whereRaw('(MAX(bid_and_ask.amount) AND bid_and_ask =',['bids']);
      // qb.whereRaw(' MAX(bid_and_ask.amount)', [options.providerId]);
    }
  }
  userdetailsMethod().then((data) => {});
}

function getAllproductByYears(req, res) {
  async function getAllproductByYearsMethod() {
    var product;
    var sql = `select P.*, i."imageUrl", 
MIN(CASE WHEN t.request='asks' and t.type='Box' THEN t.amount END) as BoxLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Box' THEN t.amount END) as BoxHighestBid,
MIN(CASE WHEN t.request='asks' and t.type='Case' THEN t.amount END) as CaseLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Case' THEN t.amount END) as CaseHighestBid
from products P
LEFT OUTER JOIN bid_and_ask t on p.id = t."productId"
LEFT OUTER JOIN images i on P.id = i."productId"
where (P."subcategoryId"= ? AND P."categoryId"=? AND P."isdeleted" = false) 
group by P.id, i."imageUrl" order by P."productName" ;`;
    var raw2 = bookshelf.knex.raw(sql, [req.body.subcategory_id, req.body.category_id]);
    raw2
      .then(function (result) {
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, result));
      })
      .catch(function (err) {
        console.log(err);
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getAllproductByYearsMethod().then(function (params) {});
}

function getSearchList(req, res) {
  async function getSearchListMethod() {
    var product;
    // var sql = `select p.*,c.*,i.*
    // from products p
    // LEFT OUTER JOIN category c on P."categoryId" = c."id"
    // LEFT OUTER JOIN images i on P."id" = i."productId"
    // WHERE ("productName" iLIKE '%'||?||'%' OR "categoryName" iLIKE '%'||?||'%')
    // ORDER BY p."productName" ASC;`
    // GROUP BY P."productName", c."categoryName"`;

    var sql = `
    select P.*,i."imageUrl", MIN(a.amount) as BoxLowestAsk, MAX(b.amount) as BoxHighestBid , MIN(c.amount) as CaseLowestAsk, MAX(d.amount) as CaseHighestBid
    From products P
  LEFT OUTER JOIN category Y on P."categoryId" = Y."id"
  LEFT OUTER JOIN bid_and_ask a on P.id = a."productId" and a."request" = 'asks' and a."type"='Box' and a.isdeleted = false and a.isactive = false
    LEFT OUTER JOIN bid_and_ask b on P.id = b."productId" and b."request" = 'bids' and b."type"='Box' and b.isdeleted = false and b.isactive = false
    LEFT OUTER JOIN bid_and_ask c on P.id = c."productId" and c."request" = 'asks' and c."type"='Case' and c.isdeleted = false and c.isactive = false
    LEFT OUTER JOIN bid_and_ask d on P.id = d."productId" and d."request" = 'bids' and d."type"='Case' and d.isdeleted = false and d.isactive = false
    LEFT OUTER JOIN images i on P.id = i."productId"
    WHERE ((P."productName" iLIKE '%'||?||'%' OR Y."categoryName" iLIKE '%'||?||'%') AND P."isdeleted" = false)
  GROUP BY P.id ,P."productName" ,a."request" , b."request" ,a."type",b."type",i."imageUrl",c."request",d."request",c."type",d."type"
  ORDER BY p."productName" ASC;
    `;
    var raw2 = bookshelf.knex.raw(sql, [req.body.search, req.body.search]);
    raw2
      .then(function (result) {
        if (result) {
          return res.json(Response(constant.statusCode.ok, constant.messages.searchresultsuccess, result));
        }
      })
      .catch(function (err) {
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getSearchListMethod().then(function (params) {});
}

function getAllNewProduct(req, res) {
  async function getAllNewProductMethod() {
    var product;
    var sql = `select P.*, i."imageUrl", 
MIN(CASE WHEN t.request='asks' and t.type='Box' THEN t.amount END) as BoxLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Box' THEN t.amount END) as BoxHighestBid,
MIN(CASE WHEN t.request='asks' and t.type='Case' THEN t.amount END) as CaseLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Case' THEN t.amount END) as CaseHighestBid
from products P
LEFT OUTER JOIN bid_and_ask t on p.id = t."productId"
LEFT OUTER JOIN images i on P.id = i."productId"
                WHERE (DATE(p."releaseDate") >= DATE(NOW()) - INTERVAL '30 days') and p."isdeleted" = false
        GROUP BY P.id ,P."productName" ,i."imageUrl"
        ORDER BY P."releaseDate" DESC`;

    // var sql = `Select P.*,i."imageUrl", MIN(a.amount) as ASKMinvalue, MAX(b.amount)  as BIDMaxvalue
    // From products P
    // LEFT OUTER JOIN bid_and_ask  a  on P.id = a."productId" and a."request" = 'asks'
    // LEFT OUTER JOIN bid_and_ask b  on P.id = b."productId" and b."request" = 'bids'
    // LEFT OUTER JOIN images i  on P.id = i."productId"
    // WHERE DATE("releaseDate") >= DATE(NOW()) - INTERVAL '30 days'
    // GROUP BY P.id ,P."productName"  ,a."request" , b."request" ,i."imageUrl"
    // ORDER BY P.id DESC`;
    var raw2 = bookshelf.knex.raw(sql, []);
    raw2
      .then(function (result) {
        //console.log(result);
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, result));
      })
      .catch(function (err) {
        console.log(err);
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getAllNewProductMethod().then(function (params) {});
}

function getProductById(req, res) {
  async function getAllNewProductMethod() {
    if (req.body && req.body.id) {
      var productId = req.body.id;
      var product;
      var sql = `Select P.*,i."imageUrl",  T."categoryName", MIN(a.amount) as BoxLowestAsk, MAX(b.amount) as BoxHighestBid , MIN(c.amount) as CaseLowestAsk, MAX(d.amount) as CaseHighestBid
      From products P
      LEFT OUTER JOIN bid_and_ask a on P.id = a."productId" and a."request" = 'asks' and a."type"='Box' and a.isdeleted = false and a.isactive = false
      LEFT OUTER JOIN bid_and_ask b on P.id = b."productId" and b."request" = 'bids' and b."type"='Box' and b.isdeleted = false and b.isactive = false
      LEFT OUTER JOIN bid_and_ask c on P.id = c."productId" and c."request" = 'asks' and c."type"='Case' and c.isdeleted = false and c.isactive = false
      LEFT OUTER JOIN bid_and_ask d on P.id = d."productId" and d."request" = 'bids' and d."type"='Case' and d.isdeleted = false and d.isactive = false
      LEFT OUTER JOIN images i on P.id = i."productId"
      LEFT OUTER JOIN category T ON P."categoryId" = T.id
              WHERE (P."id" = ?) and p."isdeleted" = false
      GROUP BY P.id ,P."productName" ,a."request" , T."categoryName", b."request" ,a."type",b."type",i."imageUrl",c."request",d."request",c."type",d."type"
      ORDER BY P.id DESC`;
      var raw2 = bookshelf.knex.raw(sql, [req.body.id]);
      raw2
        .then(function (result) {
          return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, result));
        })
        .catch(function (err) {
          console.log(err);
          return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
        });
    }
  }
  getAllNewProductMethod().then(function (params) {});
}
function getAllNewProductToday(req, res) {
  async function getAllNewProductTodayMethod() {
    //console.log(req.body);
    var product;
    var sql = `select P.*, i."imageUrl", 
MIN(CASE WHEN t.request='asks' and t.type='Box' THEN t.amount END) as BoxLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Box' THEN t.amount END) as BoxHighestBid,
MIN(CASE WHEN t.request='asks' and t.type='Case' THEN t.amount END) as CaseLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Case' THEN t.amount END) as CaseHighestBid
from products P
LEFT OUTER JOIN bid_and_ask t on p.id = t."productId"
LEFT OUTER JOIN images i on P.id = i."productId"
                WHERE (DATE(p."releaseDate") >= DATE(NOW()) - INTERVAL '1 days') and p."isdeleted" = false
        GROUP BY P.id ,P."productName" ,i."imageUrl"
        ORDER BY P."releaseDate" DESC`;

    var raw2 = bookshelf.knex.raw(sql, []);
    raw2
      .then(function (result) {
        //console.log(result);
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, result));
      })
      .catch(function (err) {
        console.log(err);
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getAllNewProductTodayMethod().then(function (params) {});
}
function getAllNewProductTwodays(req, res) {
  async function getAllNewProductTwodaysMethod() {
    //console.log(req.body);
    var product;
    var sql = `select P.*, i."imageUrl", 
MIN(CASE WHEN t.request='asks' and t.type='Box' THEN t.amount END) as BoxLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Box' THEN t.amount END) as BoxHighestBid,
MIN(CASE WHEN t.request='asks' and t.type='Case' THEN t.amount END) as CaseLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Case' THEN t.amount END) as CaseHighestBid
from products P
LEFT OUTER JOIN bid_and_ask t on p.id = t."productId"
LEFT OUTER JOIN images i on P.id = i."productId"
                WHERE (DATE(p."releaseDate") >= DATE(NOW()) - INTERVAL '2 days') and p."isdeleted" = false
        GROUP BY P.id ,P."productName",i."imageUrl"
        ORDER BY P."releaseDate" DESC`;

    var raw2 = bookshelf.knex.raw(sql, []);
    raw2
      .then(function (result) {
        //console.log(result);
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, result));
      })
      .catch(function (err) {
        console.log(err);
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getAllNewProductTwodaysMethod().then(function (params) {});
}
function getAllNewProductThreedays(req, res) {
  async function getAllNewProductThreedaysMethod() {
    //console.log(req.body);
    var product;
    var sql = `select P.*, i."imageUrl", 
MIN(CASE WHEN t.request='asks' and t.type='Box' THEN t.amount END) as BoxLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Box' THEN t.amount END) as BoxHighestBid,
MIN(CASE WHEN t.request='asks' and t.type='Case' THEN t.amount END) as CaseLowestAsk,
MAX(CASE WHEN t.request='bids' and t.type='Case' THEN t.amount END) as CaseHighestBid
from products P
LEFT OUTER JOIN bid_and_ask t on p.id = t."productId"
LEFT OUTER JOIN images i on P.id = i."productId"
                WHERE (DATE(p."releaseDate") >= DATE(NOW()) - INTERVAL '3 days') and p."isdeleted" = false
        GROUP BY P.id ,P."productName" ,i."imageUrl"
        ORDER BY P."releaseDate" DESC`;

    var raw2 = bookshelf.knex.raw(sql, []);
    raw2
      .then(function (result) {
        //console.log(result);
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, result));
      })
      .catch(function (err) {
        console.log(err);
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getAllNewProductThreedaysMethod().then(function (params) {});
}

function getNewListingProduct(req, res) {
  async function getNewListingProductMethod() {
    //console.log(req.body);
    var product;
    var sql = `SELECT * FROM products WHERE  "isdeleted" = false AND DATE("releaseDate") >= DATE(NOW()) - INTERVAL '30 days'`;
    var raw2 = bookshelf.knex.raw(sql, []);
    raw2
      .then(function (result) {
        console.log("varun------------->", result);
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, result));
      })
      .catch(function (err) {
        console.log(err);
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
  }
  getNewListingProductMethod().then(function (params) {});
}

function saveCategoryMapping(req, res) {
  async function saveCategoryMappingMethod() {
    //console.log('hiiiiiiiiiiiiiiiii---->',req.body);
    const { category_id, subcategory_id, createdById } = req.body;
    let isDuplictate = false;
    let condition = `select * from cat_subcat_mapping where "category_id"='${category_id}' and "subcategory_id"='${subcategory_id}';`;
    //console.log('query:--------->',condition);return;
    let checkDuplicate = await bookshelf.knex.raw(condition);
    console.log("scat map duplicate check");
    if (checkDuplicate.rowCount > 0) {
      isDuplictate = true;
    }
    if (!isDuplictate) {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();

      newdate = year + "-" + month + "-" + day;

      let data = {
        category_id: category_id ? category_id : null,
        subcategory_id: subcategory_id ? subcategory_id : null,
        created_at: newdate,
        updated_at: newdate,
        status: 1,
      };
      try {
        let saveCategoryData = await common_query.saveRecord(CatSubcatMappingModel, data);
        console.log("scategory map", saveCategoryData);
      } catch (error) {
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      }
    }
  }
  saveCategoryMappingMethod().then((data) => {});
}
