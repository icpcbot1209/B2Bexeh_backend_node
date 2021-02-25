const authMiddleware = require('../auth-middleware');

module.exports = function (express) {
  var router = express.Router();

  const user = require('./controllers/user');
  router.post('/users/readItems', authMiddleware, user.readItems);
  router.post('/users/updateItem', authMiddleware, user.updateItem);
  router.post('/users/deleteItem', authMiddleware, user.deleteItem);

  const category = require('./controllers/category');
  router.post('/categories/readItems', authMiddleware, category.readItems);
  router.post('/categories/createItem', authMiddleware, category.createItem);
  router.post('/categories/updateItem', authMiddleware, category.updateItem);
  router.post('/categories/deleteItem', authMiddleware, category.deleteItem);

  const subcategory = require('./controllers/subcategory');
  router.post('/subcategories/readItems', authMiddleware, subcategory.readItems);
  router.post('/subcategories/createItem', authMiddleware, subcategory.createItem);
  router.post('/subcategories/updateItem', authMiddleware, subcategory.updateItem);
  router.post('/subcategories/deleteItem', authMiddleware, subcategory.deleteItem);

  const product = require('./controllers/product');
  router.post('/products/readItems', authMiddleware, product.readItems);
  router.post('/products/createItem', authMiddleware, product.createItem);
  router.post('/products/updateItem', authMiddleware, product.updateItem);
  router.post('/products/deleteItem', authMiddleware, product.deleteItem);

  const transaction = require('./controllers/transaction');
  router.post('/transactions/readItems', authMiddleware, transaction.readItems);
  router.post('/transactions/updateItem', authMiddleware, transaction.updateItem);

  return router;
};
