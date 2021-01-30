module.exports = function (router) {
  var auth = require('app/utils/crypto');
  // var auth = require('./../../../../utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  var ctrl = require('./controllers/offers_ctrl');
  router.post('/user/getMyOffers', middlewares, ctrl.getMyOffers);
  router.post('/user/getLatestOffers', middlewares, ctrl.getLatestOffers);
  router.post('/user/getOffersByProductId', middlewares, ctrl.getOffersByProductId);
  return router;
};
