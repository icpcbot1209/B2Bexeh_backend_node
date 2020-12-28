module.exports = function (router) {
    var auth = __rootRequire("app/utils/crypto");
    // var auth = __rootRequire('./../../../../utils/crypto');
    var middlewares = [auth.ensureAuthorized];

    
    var feedback = require('./controllers/feedback_ctrl');
    
    router.post('/feedback/savefeedback',middlewares,feedback.savefeedback);
    router.post('/feedback/getAllfeedbacks',middlewares,feedback.getAllfeedbacks);
    router.get('/feedback/getfeedback/:id',middlewares,feedback.getfeedback);
    router.post('/feedback/deletefeedback',middlewares,feedback.deletefeedback)
    router.post('/feedback/editfeedback',middlewares,feedback.editfeedback)
    router.post('/feedback/statusChange',middlewares,feedback.statusChange)
    

    return router;
}