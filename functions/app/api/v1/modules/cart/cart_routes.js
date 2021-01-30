module.exports = function (router) {
  var auth = require('app/utils/crypto');
  // var auth = require('./../../../../utils/crypto');

  var middlewares = [auth.ensureAuthorized];

  var cart = require('./controllers/cart_ctrl');

  router.post('/cart/addtocart', cart.addToCart);
  router.post('/cart/listAddToCart', cart.fetchCartData);
  router.post('/cart/deleteFromCart', cart.deleteCartItem);
  router.post('/cart/sendOfferFromCart', cart.sendOfferFromCart);

  return router;
};
