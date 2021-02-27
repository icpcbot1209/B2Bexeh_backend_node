module.exports = function (express) {
  var router = express.Router();

  const authMiddleware = require('../auth-middleware');

  const user = require('./controllers/user');
  router.post('/user/createUser', user.createUser);
  router.post('/user/getUserByUid', user.getUserByUid);
  router.post('/user/getUserById', user.getUserById);
  router.post('/user/updateUser', authMiddleware, user.updateUser);

  const consts = require('./controllers/consts');
  router.post('/consts/getDealmethods', consts.getDealmethods);

  const product = require('./controllers/product');
  router.post('/product/getCategories', authMiddleware, product.getCategories);
  router.post('/product/getSubategories', authMiddleware, product.getSubategories);
  router.post('/product/getSubcategoriesByCate', authMiddleware, product.getSubcategoriesByCate);
  router.post('/product/getByCategory', authMiddleware, product.getByCategory);
  router.post('/product/getById', authMiddleware, product.getById);
  router.post('/product/getWatchlist', authMiddleware, product.getWatchlist);
  router.post('/product/existInWatchlist', authMiddleware, product.existInWatchlist);
  router.post('/product/addToWatchlist', authMiddleware, product.addToWatchlist);
  router.post('/product/removeFromWatchlist', authMiddleware, product.removeFromWatchlist);

  const hope = require('./controllers/hope');
  router.post('/hope/createOne', authMiddleware, hope.createOne);
  router.post('/hope/updateOne', authMiddleware, hope.updateOne);
  router.post('/hope/deleteOne', authMiddleware, hope.deleteOne);
  router.post('/hope/readByProductId', authMiddleware, hope.readByProductId);
  router.post('/hope/getByCategory', authMiddleware, hope.getByCategory);
  router.post('/hope/getMyHopes', authMiddleware, hope.getMyHopes);

  const offer = require('./controllers/offer');
  router.post('/offer/getMyOffers', authMiddleware, offer.getMyOffers);
  router.post('/offer/createOne', authMiddleware, offer.createOne);
  router.post('/offer/getOne', authMiddleware, offer.getOne);
  router.post('/offer/accept', authMiddleware, offer.accept);
  router.post('/offer/decline', authMiddleware, offer.decline);
  router.post('/offer/markAsPaid', authMiddleware, offer.markAsPaid);
  router.post('/offer/markAsShipped', authMiddleware, offer.markAsShipped);
  router.post('/offer/giveFeedback2Seller', authMiddleware, offer.giveFeedback2Seller);
  router.post('/offer/giveFeedback2Buyer', authMiddleware, offer.giveFeedback2Buyer);
  router.post('/offer/changeTerms', authMiddleware, offer.changeTerms);

  return router;
};
