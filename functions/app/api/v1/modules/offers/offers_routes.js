module.exports = function (router) {
  var auth = __rootRequire('app/utils/crypto');
  // var auth = __rootRequire('./../../../../utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  var ctrl = require('./controllers/offers_ctrl');
  router.post('/user/getMyOffers', middlewares, ctrl.getMyOffers);
  router.post('/user/getLatestOffers', middlewares, ctrl.getLatestOffers);
  router.post('/user/getOffersByProductId', middlewares, ctrl.getOffersByProductId);
  return router;
};
