module.exports = function (express) {
  var router = express.Router();
  router.get('/test', (req, res) => {
    console.log(`${Date.now()}`);
    return res.send(`${Date.now()}`);
  });

  var auth = require('app/utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  const user = require('./controllers/user');
  router.post('/user/getUserById', middlewares, user.getUserById);
  router.post('/user/getTenUsers', middlewares, user.getTenUsers);

  const product = require('./controllers/product');
  router.post('/product/getByCategory', middlewares, product.getByCategory);

  const hope = require('./controllers/hope');
  router.post('/hope/createOne', middlewares, hope.createOne);
  router.post('/hope/readByProductId', middlewares, hope.readByProductId);
  router.post('/hope/getByCategory', middlewares, hope.getByCategory);

  const offer = require('./controllers/offer');
  router.post('/offer/getMyOffers', middlewares, offer.getMyOffers);
  router.post('/offer/createOne', middlewares, offer.createOne);
  router.post('/offer/getOne', middlewares, offer.getOne);
  router.post('/offer/accept', middlewares, offer.accept);
  router.post('/offer/decline', middlewares, offer.decline);

  return router;
};
