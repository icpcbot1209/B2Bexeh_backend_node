module.exports = function (router) {
  var auth = require('app/utils/crypto');
  // var auth = require('./../../../../utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  var product = require('./controllers/product_ctrl');

  router.post('/product/saveProduct', middlewares, product.saveProduct);
  router.post('/product/getProductDetails', middlewares, product.getProductDetails);
  router.post('/product/getAllCategorysYears', middlewares, product.getAllCategorysYears);
  router.post('/product/getAllProducts', middlewares, product.getAllProducts);
  router.post('/product/getAllproductByYears', middlewares, product.getAllproductByYears);
  router.post('/product/getSearchList', middlewares, product.getSearchList);
  router.post('/product/editProduct', middlewares, product.editProduct);
  router.get('/product/getProduct/:id', middlewares, product.getProduct);
  router.post('/product/deleteProduct', middlewares, product.deleteProduct);
  router.post('/product/getAllCategorysYearstest', middlewares, product.getAllCategorysYearstest);
  router.post('/product/getAllNewProduct', middlewares, product.getAllNewProduct);
  router.post('/product/getPopularProduct', middlewares, product.getPopularProduct);
  router.post('/product/getProductById', middlewares, product.getProductById);
  router.post('/product/productFeatureChange', middlewares, product.productFeatureChange);
  router.post('/product/getNewListingProduct', middlewares, product.getNewListingProduct);
  router.post('/product/getAllNewProductToday', middlewares, product.getAllNewProductToday);
  router.post('/product/getAllNewProductTwodays', middlewares, product.getAllNewProductTwodays);
  router.post('/product/getAllNewProductThreedays', middlewares, product.getAllNewProductThreedays);
  router.post('/product/createCounter', middlewares, product.createCounter);
  router.post('/product/bulkUpload', middlewares, product.bulkUpload);
  router.get('/product/exportcsvbulkupload', middlewares, product.exportcsvBulkUpload);

  return router;
};
