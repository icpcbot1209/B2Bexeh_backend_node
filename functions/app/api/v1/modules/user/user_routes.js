module.exports = function (router) {
  var auth = require('app/utils/crypto');
  // var auth = require('./../../../../utils/crypto');

  var middlewares = [auth.ensureAuthorized];

  var user = require('./controllers/user_ctrl');
  var user1 = require('./controllers/offer');

  router.post('/user/userRegister', user.saveUser);
  router.post('/user/updateUserData', user.updateUserData);
  router.post('/user/test', user.test);
  router.post('/user/userlogin', user.login);
  router.post('/user/forgotPassword', user.forgotPassword);
  router.post('/user/resetPassword', user.resetpassword);
  router.post('/user/getAllUsers', middlewares, user.getAllUsers);
  router.post('/user/getTransactionList', middlewares, user.getTransactionList);
  router.get('/user/exportTransactionList', middlewares, user.exportTransactionList);
  router.post('/user/getAllAdminUsers', middlewares, user.getAllAdminUsers);
  router.post('/user/getUser', middlewares, user.getUser);
  router.post('/user/editUser', middlewares, user.editUser);
  router.post('/user/deleteUser', middlewares, user.deleteUser);
  router.post('/user/userdetails', middlewares, user.userdetails);
  router.post('/user/addWatchList', middlewares, user.AddWatchList);
  router.post('/user/updateprofile', middlewares, user.updateprofile);
  router.post('/user/getWatchListData', middlewares, user.getWatchListData);
  router.post('/user/getAllWatchListData', middlewares, user.getAllWatchListData);
  router.post('/user/login2', user.login2);
  router.post('/user/sendContactUs', user.sendContactUs);
  router.post('/user/getOfferById', middlewares, user.getOfferById);
  router.post('/user/acceptOffer', middlewares, user.acceptOffer);
  router.post('/user/cancelOffer', middlewares, user.cancelOffer);

  router.post('/user/addTrackNo', middlewares, user.addTrackNo);
  router.post('/user/addPaymentDetail', middlewares, user.addPaymentDetail);
  router.post('/user/declineOffer', middlewares, user.declineOffer);
  router.post('/user/confirmDelivery', middlewares, user.confirmDelivery);
  router.post('/user/getActiveOfferByUserId', middlewares, user.getActiveOfferByUserId);
  router.post('/user/getActiveRecievedByUserId', middlewares, user.getActiveRecievedByUserId);

  router.post('/user/getAcceptOfferByUserId', middlewares, user1.getAcceptOfferByUserId);
  router.post('/user/getRecievedOfferByUserId', middlewares, user1.getRecievedOffers);
  router.post('/user/getSentOfferByUserId', middlewares, user1.getSentOffers);
  router.post('/user/getClosedOfferByUserId', middlewares, user1.getClosedOfferByUserId);

  router.post('/user/getSentAcceptOfferByUserId', middlewares, user.getSentAcceptOfferByUserId);
  router.post('/user/getPendingOfferByUserId', middlewares, user.getPendingOfferByUserId);
  router.post('/user/deleteOffer', middlewares, user.deleteOffer);
  router.post('/user/deleteAllOffer', middlewares, user.deleteAllOffer);
  router.post('/user/addNotification', middlewares, user.addNotification);
  router.post('/user/getNotificationByUserId', middlewares, user.getNotificationByUserId);
  router.post('/user/readNotification', middlewares, user.readNotification);
  router.post('/user/deleteNotification', middlewares, user.deleteNotification);
  router.post('/user/saveEmailBlast', middlewares, user.saveEmailBlast);
  router.get('/user/getEmailBlastUser', middlewares, user.getEmailBlastUser);
  router.post('/user/getLastThreeTransaction', middlewares, user.getLastThreeTransaction);
  router.post('/user/statusChange', middlewares, user.statusChange);
  router.post('/user/saveTxnHistory', middlewares, user.saveTxnHistory);
  router.post('/user/getTxnHistory', middlewares, user.getTxnHistory);
  router.post('/user/getCounter', middlewares, user1.getCounters);
  router.post('/user/getUsers', middlewares, user1.getUsers);
  router.post('/user/getChatOffers', middlewares, user1.getChatOfferList);

  return router;
};
