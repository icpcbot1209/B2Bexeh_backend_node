
var bookshelf = __rootRequire('app/config/bookshelf');
var config = __rootRequire('app/config/config').get('local');
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
var mkdirp = require('mkdirp');
var SubcategoryModel = loader.loadModel('/subcategory/models/subcategory_models');


var jwt = require('jsonwebtoken');

var constant = require('../../../../../utils/constants');
var common_query = require('../../../../../utils/commonQuery');
var Response = require('../../../../../utils/response');

const uuidv4 = require('uuid/v4');
const formidable = require('formidable');
module.exports = {
    saveSubcategory:saveSubcategory,
    getallSubcategoryBycate:getallSubcategoryBycate,
    getallSubcategory:getallSubcategory,
    deletesubcategory:deletesubcategory,
    editsubcategory:editsubcategory,
    getSubCategoryList:getSubCategoryList,
    getSearchSubCategory:getSearchSubCategory,
    getSubcategory:getSubcategory
};

function getSubCategoryList(req,res){
  async function getSubCategoryList(){
    try{
      let sql =`SELECT DISTINCT subcategory_name FROM subcategory order by subcategory_name DESC;`
      bookshelf.knex.raw(sql).then(data => {
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
      }).catch(err => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    }
    catch(err){
      console.log("err in getSubCategoryList",err)
    }
  }
  getSubCategoryList().then((data) => {
  })
}

function getSearchSubCategory(req,res){
  async function getSearchSubCategory(){
    try{
      var sql = `
      SELECT * FROM subcategory C
      WHERE ((C."subcategory_name"::TEXT iLIKE '%'||?||'%') AND C."isdeleted" = false)
      GROUP BY C.id ,C."subcategory_name"
      ORDER BY C."subcategory_name" ASC;
      `
      var raw2 = bookshelf.knex.raw(sql, [req.body.search]);
      raw2.then(function (result) {
        if (result) {
          return res.json(Response(constant.statusCode.ok, constant.messages.searchresultsuccess, result));
        }
      })
      .catch(function (err) {
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      });
    }
    catch(err){
      console.log("err in getSearchSubCategory",err)
    }
  }
  getSearchSubCategory().then((data) => {
  })
}


function getallSubcategory(req, res) {
  async function getallSubcategoryMethod() {
    try {
      let limit = req.body.pagePerLimit || 10;
      let page = req.body.currentPage - 1 || 0;
      let isdeleted = req.body.isdeleted || false;
      let offset = limit * page;

      let searchChar;
      if(req.body.searchChar)
      {
        searchChar=`"subcategory_name" = ${req.body.searchChar} and `
      }

      let columnName = req.body.columnName || "subcategory_name";
      let sortingOrder = req.body.sortingOrder || "ASC";
      
      let sql =`SELECT s.*,count(*) OVER() AS full_count FROM subcategory s
      WHERE ${searchChar?searchChar:''} s.isdeleted=? ORDER BY s."${columnName}" ${sortingOrder} OFFSET ? LIMIT ?;`
      bookshelf.knex.raw(sql, [isdeleted, offset, limit]).then(data => {
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, data));
      }).catch(err => res.json(Response(constant.statusCode.notFound, constant.validateMsg.noRecordFound)));
    }
    catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getallSubcategoryMethod().then((data) => {
  })
}
  
  function editsubcategory(req, res) {
    async function editsubcategoryMethod() {
      let updatedata = {
        subcategory_name: req.body.subcategory_name ? req.body.subcategory_name : null,
      }
      let condition = {
        id: req.body.id
      }
      let updateUserData = await common_query.updateRecord(SubcategoryModel, updatedata, condition);
      if (updateUserData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
      }
    }
    editsubcategoryMethod().then((data) => {
  
      
    })
  }

  function deletesubcategory(req, res) {
    async function deletesubcategoryMethod() {
      //console.log(req.bodegistey);
      let updatedata = {
        isdeleted: true
      }
      let condition = {
        id: req.body.id
  
      }
      let updateUserData = await common_query.updateRecord(SubcategoryModel, updatedata, condition);
      if (updateUserData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.DeleteSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
      }
    }
    deletesubcategoryMethod().then((data) => {
  
    })
  }
  
function getSubcategory(req, res) {
  async function getSubcategoryMethod() {
    try {
      let condition = `select * from subcategory where "id"= ${req.params.id} and "isdeleted"=false;`
      let category = await bookshelf.knex.raw(condition);
      if (category.rowCount > 0 || category.rowCount == 0) {
        return res.json(Response(constant.statusCode.ok, constant.messages.recordFetchedSuccessfully, category.rows[0]));
      }
      else {
        return res.json(Response(constant.statusCode.alreadyExist, 'No Data Found'));
      }
    }
    catch (err) {
      console.log("Error in getSubcategory")
    }
  }
  getSubcategoryMethod().then((data) => {
  })
}


function getallSubcategoryBycate(req, res) {
  async function getallSubcategoryBycateMethod() {
    try {
      let condition = `select SC.* from cat_subcat_mapping  as CSM 
      LEFT OUTER JOIN subcategory SC on CSM.subcategory_id = SC."id" and SC."isdeleted"=false
      where "category_id"= ${req.body.category_id} and "status"=1 order by SC."subcategory_name" DESC;`
      let productList = await bookshelf.knex.raw(condition);
      if (productList.rowCount > 0 || productList.rowCount == 0) {
        return res.json(Response(constant.statusCode.ok, constant.messages.allProductFetchedSuccessfully, productList));
      }
      else {
        return res.json(Response(constant.statusCode.alreadyExist, 'No Data Found'));
      }
    }
    catch (err) {
      console.log("Error in getallSubcategoryBycate")
    }
  }
  getallSubcategoryBycateMethod().then((data) => {
  })
}
  function saveSubcategory(req, res) {
    async function saveSubcategoryMethod() {
      //console.log(req.body);
      const {
        subcategory_name,
        createdById,
  
      } = req.body;
      let isDuplictate=false;
      let condition = `select * from subcategory where "subcategory_name"='${subcategory_name}' and isdeleted = false;`
      let checkDuplicate = await bookshelf.knex.raw(condition);
      if (checkDuplicate.rowCount > 0) {
        isDuplictate = true;
        return res.json(Response(constant.statusCode.alreadyExist, 'Sub Category Name is already present, choose another Sub Category Name'));
      }
      if (!isDuplictate) {
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
  
        newdate = year + "-" + month + "-" + day;
  
        let data = {
          subcategory_name: subcategory_name ? subcategory_name : null,
          createdById: req.user._id,
          createdAt: newdate,
          isdeleted: false,
        }
      
  
      try {
  
        let saveCategoryData = await common_query.saveRecord(SubcategoryModel, data);
        if (saveCategoryData.code == 200) {
          return res.json(Response(constant.statusCode.ok, constant.messages.subcategoryFetchedSuccessfully, saveCategoryData));
        } else if (saveCategoryData.code == 409) {
  
          return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
        }
      }
      
      catch (error) {
        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist))
      }
    }
    }
    saveSubcategoryMethod().then((data) => {
    })
  }
