module.exports = function (express) {
  var router = express.Router();
  router.get('/test', (req, res) => {
    console.log(`${Date.now()}`);
    return res.send(`${Date.now()}`);
  });

  var auth = __rootRequire('app/utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  const user = require('./controllers/user');
  router.post('/user/getUserById', middlewares, user.getUserById);
  router.post('/user/getTenUsers', middlewares, user.getTenUsers);

  const offer = require('./controllers/offer');
  router.post('/offer/createOffer', middlewares, offer.createOffer);

  return router;
};
