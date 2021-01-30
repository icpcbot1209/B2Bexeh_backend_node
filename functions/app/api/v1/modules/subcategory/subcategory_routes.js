module.exports = function (router) {
  var auth = require('app/utils/crypto');
  // var auth = require('./../../../../utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  var subcategory = require('./controllers/subcategory_ctrl');

  router.post('/subcategory/saveSubcategory', middlewares, subcategory.saveSubcategory);
  router.post('/subcategory/getallSubcategoryBycate', middlewares, subcategory.getallSubcategoryBycate);
  router.get('/subcategory/getSubcategory/:id', middlewares, subcategory.getSubcategory);
  router.post('/subcategory/getallSubcategory', middlewares, subcategory.getallSubcategory);
  router.post('/subcategory/editsubcategory', middlewares, subcategory.editsubcategory);
  router.post('/subcategory/deletesubcategory', middlewares, subcategory.deletesubcategory);
  router.post('/subcategory/getSubCategoryList', middlewares, subcategory.getSubCategoryList);
  router.post('/subcategory/getSearchSubCategory', middlewares, subcategory.getSearchSubCategory);
  return router;
};
