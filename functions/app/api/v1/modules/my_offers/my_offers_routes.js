module.exports = function (router) {
  var auth = __rootRequire("app/utils/crypto");
  // var auth = __rootRequire('./../../../../utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  var ctrl = require("./controllers/myOffers_ctrl");
  router.post("/user/getMyOffers", middlewares, ctrl.getMyOffers);

  return router;
};
