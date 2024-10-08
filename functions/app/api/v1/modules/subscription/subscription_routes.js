module.exports = function (router) {
  var auth = require('app/utils/crypto');
  // var auth = require('./../../../../utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  var subscription = require('./controllers/subscription_ctrl');

  router.post('/subscription/savesubscription', middlewares, subscription.savesubscription);
  router.post('/subscription/getAllsubscriptions', middlewares, subscription.getAllsubscriptions);
  router.get('/subscription/getsubscription/:id', middlewares, subscription.getsubscription);
  router.post('/subscription/deletesubscription', middlewares, subscription.deletesubscription);
  router.post('/subscription/editsubscription', middlewares, subscription.editsubscription);

  return router;
};
