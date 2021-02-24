const authMiddleware = require('../auth-middleware');

module.exports = function (express) {
  var router = express.Router();

  const user = require('./controllers/user');
  router.post('/users/readItems', authMiddleware, user.readItems);
  router.post('/users/updateItem', authMiddleware, user.updateItem);
  router.post('/users/deleteItem', authMiddleware, user.deleteItem);

  return router;
};
