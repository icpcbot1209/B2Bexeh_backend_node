module.exports = function (router) {
    var auth = __rootRequire("app/utils/crypto");
    // var auth = __rootRequire('./../../../../utils/crypto');
     
    var middlewares = [auth.ensureAuthorized];

    var adminsetting = require('./controllers/admin_setting_ctrl');
    
    router.post('/setting/enabledisablesubscription',adminsetting.changeSubscriptionStatus);
    router.post('/setting/updateEmailStatus',adminsetting.updateEmailStatus);
    router.post('/setting/updateSmtpStatus',adminsetting.updateSmtpStatus);
    router.post('/setting/updatePaypalStatus',adminsetting.updatePaypalStatus);
    router.post('/setting/updateCartStatus',adminsetting.updateCartStatus);
    router.post('/setting/updateContactStatus',adminsetting.updateContactStatus);
    router.get('/setting/settingstatus',adminsetting.getsettingStatus)
    return router;
}

