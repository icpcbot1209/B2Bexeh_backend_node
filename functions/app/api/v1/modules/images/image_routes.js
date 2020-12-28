module.exports = function (router) {
    // var auth = __rootRequire("app/utils/crypto");
    // var middlewares = [auth.ensureAuthorized];

    var category = require('./controllers/image_ctrl');
    
    // router.post('/iage/saveCategory',category.saveCategory);
    // router.post('/category/getAllCategorys',category.getAllCategorys);
    // router.get('/user/selectRandomProvider',middlewares,user.selectRandomProvider);
    // router.post('/user/makeProviderAsAdmin',middlewares,user.makeProviderAsAdmin);
    // router.post('/user/makeAdminAsProvider',middlewares,user.makeAdminAsProvider);
    
    return router;
}

