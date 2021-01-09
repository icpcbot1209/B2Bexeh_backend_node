var bookshelf = __rootRequire("app/config/bookshelf");
var config = __rootRequire("app/config/constant");
var Joi = require("joi");
var moment = require("moment");
var crypto = __rootRequire("app/utils/crypto");
var loader = __rootRequire("app/api/v1/loader");
var santize = __rootRequire("app/utils/santize");
var i18n = require("i18n");
var _ = require("lodash");
var __ = require("underscore");
var text = __rootRequire("app/utils/text");
var async = require("async");
var CategoryModel = loader.loadModel("/category/models/category_models");
// var AddressModel = loader.loadModel('/address/models/address_models');
var jwt = require("jsonwebtoken");
// var MetricesSettingProviderModel = loader.loadModel('/metrices_setting_provider/models/metrices_setting_provider_model');
// var MetricesSettingModel = loader.loadModel('/metrices_setting/models/metrices_setting_model');
var constant = require("../../../../../utils/constants");
var common_query = require("../../../../../utils/commonQuery");
var Response = require("../../../../../utils/response");
const uuidv4 = require("uuid/v4");

module.exports = {
  saveCategory: saveCategory,
  getAllCategorys: getAllCategorys,
  editCategory: editCategory,
  deleteCategory: deleteCategory,
  getSearchCategoryList: getSearchCategoryList,
  getCategory: getCategory,
};
function editCategory(req, res) {
  async function editCategoryMethod() {
    console.log(req.bodegistey);
    let updatedata = {
      categoryName: req.body.categoryName ? req.body.categoryName : null,
      priority: req.body.priority ? req.body.priority : null,
    };
    let condition = {
      id: req.body.id,
    };
    try {
      let updateUserData = await common_query.updateRecord(CategoryModel, updatedata, condition);
      if (updateUserData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.UpdateSuccess, updateUserData));
      } else {
        return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
      }
    } catch (error) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }

  editCategoryMethod().then((data) => {});
}
function deleteCategory(req, res) {
  async function deleteCategoryMethod() {
    let updatedata = {
      isdeleted: true,
    };
    let condition = {
      id: req.body.id,
    };
    let updateUserData = await common_query.updateRecord(CategoryModel, updatedata, condition);
    if (updateUserData.code == 200) {
      return res.json(Response(constant.statusCode.ok, constant.messages.DeleteSuccess, updateUserData));
    } else {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
    }
  }
  deleteCategoryMethod().then((data) => {});
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

function saveCategory(req, res) {
  async function saveCategoryMethod() {
    console.log(req.body);
    const { categoryName, createdById, priority } = req.body;

    let isDuplictate = false;
    let condition = `select * from category where "categoryName" ilike '${categoryName}' and isdeleted = false;`;
    let checkDuplicate = await bookshelf.knex.raw(condition);
    if (checkDuplicate.rowCount > 0) {
      isDuplictate = true;
      return res.json(Response(constant.statusCode.alreadyExist, "Sub Category Name is already present, choose another Sub Category Name"));
    }
    if (!isDuplictate) {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      console.log(req.user._id);

      newdate = year + "-" + month + "-" + day;
      let data = {
        categoryName: categoryName ? categoryName : null,
        priority: priority ? priority : null,
        createdById: req.user._id,
        createdAt: newdate,
        isdeleted: false,
        category_id: uuidv4(),
      };

      let saveCategoryData = await common_query.saveRecord(CategoryModel, data);
      //   console.log(saveUserData);
      if (saveCategoryData.code == 200) {
        return res.json(Response(constant.statusCode.ok, constant.messages.categoryFetchedSuccessfully, saveCategoryData));
      } else if (saveCategoryData.code == 409) {
        //  console.log("saveCategoryData===>in else");

        return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
      }
    }
  }
  saveCategoryMethod().then((data) => {});
}

function getSearchCategoryList(req, res) {
  async function getSearchCategoryListMethod() {
    try {
      var sql = `
      SELECT * FROM category C
      WHERE ((C."categoryName" iLIKE '%'||?||'%') AND C."isdeleted" = false)
      GROUP BY C.id ,C."categoryName"
      ORDER BY C."categoryName" ASC;
      `;
      var raw2 = bookshelf.knex.raw(sql, [req.body.search]);
      raw2
        .then(function (result) {
          if (result) {
            return res.json(Response(constant.statusCode.ok, constant.messages.searchresultsuccess, result));
          }
        })
        .catch(function (err) {
          return res.json(Response(constant.statusCode.alreadyExist, constant.validateMsg.emailAlreadyExist));
        });
    } catch (err) {
      return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.commonError));
    }
  }
  getSearchCategoryListMethod().then((data) => {});
}

function getAllCategorys(req, res) {
  async function getAllCategorysMethod() {
    try {
      let limit = req.body.pagePerLimit || 10;
      let page = req.body.currentPage - 1 || 0;
      let isdeleted = req.body.isdeleted || false;
      let offset = limit * page;
      let columnName = req.body.columnName || "categoryName";
      let sortingOrder = req.body.sortingOrder || "ASC";
      let searchChar;
      if (req.body.searchChar) {
        searchChar = `"categoryName" ilike '%${req.body.searchChar}%' and `;
      }
      // let sql = `SELECT *, count(*) OVER() AS full_count FROM category WHERE ${searchChar?searchChar:''} isdeleted=? ORDER BY "${columnName}" ${sortingOrder} OFFSET ? LIMIT ?;`

      let sql = `select *, count(*) OVER() AS full_count from category where ${searchChar ? searchChar : ""} isdeleted=? 
order by  
CASE WHEN priority  is not null THEN priority  end asc ,
CASE WHEN priority  is null  THEN  "${columnName}"  end ${sortingOrder} OFFSET ? LIMIT ?;`;
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
  getAllCategorysMethod().then((data) => {});
}

function getCategory(req, res) {
  async function getCategoryMethod() {
    try {
      let isdeleted = req.body.isdeleted || false;
      let sql = `select * from category where "id"= ${req.params.id} and "isdeleted"=false;`;
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
  getCategoryMethod().then((data) => {});
}
