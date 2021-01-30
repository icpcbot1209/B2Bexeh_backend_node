module.exports = function (router) {
  var auth = require('app/utils/crypto');
  var middlewares = [auth.ensureAuthorized];

  var bidsasks = require('./controllers/bidsasks_ctrl');

  router.post('/bidsasks/createbidsorask', middlewares, bidsasks.createbidsorask);
  router.post('/bidsasks/getAllBidAndAsks', middlewares, bidsasks.getAllBidAndAsks);
  router.post('/bidsasks/getAllMybidOrAsk', middlewares, bidsasks.getAllMybidOrAsk);
  router.post('/bidsasks/getHighestBidLowestAsk', middlewares, bidsasks.getHighestBidLowestAsk);
  router.post('/bidsasks/getfilterData', middlewares, bidsasks.getfilterData);
  router.post('/bidsasks/getListingSearch', middlewares, bidsasks.getListingSearch);
  router.post('/bidsasks/getHighestBidOrMinAsk', middlewares, bidsasks.getHighestBidOrMinAsk);
  router.post('/bidsasks/getUserData', middlewares, bidsasks.getUserData);
  router.post('/bidsasks/deleteBidOrAsk', middlewares, bidsasks.deleteBidOrAsk);
  router.post('/bidsasks/inactiveBidOrAsk', middlewares, bidsasks.inactiveBidOrAsk);
  router.post('/bidsasks/updateMyAsk', middlewares, bidsasks.updateMyAsk);
  router.post('/bidsasks/inactiveAllBidOrAsk', middlewares, bidsasks.inactiveAllBidOrAsk);
  router.post('/bidsasks/deleteAllBidOrAsk', middlewares, bidsasks.deleteAllBidOrAsk);
  router.post('/bidsasks/updateBidOrAsk', middlewares, bidsasks.updateBidOrAsk);
  router.post('/bidsasks/updateNotes', middlewares, bidsasks.updateNotes);
  router.post('/bidsasks/deleteListingBidOrAsk', middlewares, bidsasks.deleteListingBidOrAsk);
  router.post('/bidsasks/inactiveListingBidOrAsk', middlewares, bidsasks.inactiveListingBidOrAsk);
  router.post('/bidsasks/getlistingfilterData', middlewares, bidsasks.getlistingfilterData);
  router.post('/bidsasks/getUserProfilelistingfilter', middlewares, bidsasks.getUserProfilelistingfilter);
  router.post('/bidsasks/getBidAndAskId', middlewares, bidsasks.getBidAndAskId);
  router.post('/chat/createRoom', bidsasks.createRoom);
  router.post('/chat/getcontactlist', bidsasks.fetchContactList);
  router.post('/chat/getchatlist', bidsasks.fetchChat);
  router.post('/chat/searchContact', bidsasks.searchContact);
  router.post('/bidsasks/getUserBid', middlewares, bidsasks.getUserBid);
  router.post('/bidsasks/uploadListing', middlewares, bidsasks.uploadListing);
  router.post('/chat/getofferlist', bidsasks.listOfferForChat);
  router.post('/bidsasks/getUserFeedback', middlewares, bidsasks.getUserFeedback);
  router.post('/bidsasks/updateBidAndAsk', middlewares, bidsasks.updateBidAndAsk);
  router.post('/bidsasks/saveCounterHistory', bidsasks.saveCounterHistory);
  router.post('/bidsasks/getCounterHistory', bidsasks.getCounterHistory);
  // router.post('/chat/getcontactlist',bidsasks.fetchContactList);listOfferForChat

  return router;
};
