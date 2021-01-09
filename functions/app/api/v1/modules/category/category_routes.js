module.exports = function (router) {
  var auth = __rootRequire("app/utils/crypto");
  // var auth = __rootRequire('./../../../../utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  var category = require("./controllers/category_ctrl");

  router.post("/category/saveCategory", middlewares, category.saveCategory);
  router.post("/category/getAllCategorys", middlewares, category.getAllCategorys);
  router.get("/category/getCategory/:id", middlewares, category.getCategory);
  router.post("/category/deleteCategory", middlewares, category.deleteCategory);
  router.post("/category/editCategory", middlewares, category.editCategory);
  router.post("/category/getSearchCategoryList", middlewares, category.getSearchCategoryList);
  return router;
};
