module.exports = function (express) {
    var router = express.Router()
    
// user
require('./modules/user/user_routes')(router);

// category
require('./modules/category/category_routes')(router);


// product
require('./modules/product/product_routes')(router);

//bids and Asks

require('./modules/bidsAsks/bidsasks_routes')(router);

//subcategory

require('./modules/subcategory/subcategory_routes')(router);

//subscriptions

require('./modules/subscription/subscription_routes')(router);

//feedback

require('./modules/feedback/feedback_routes')(router);
//cart 
require('./modules/cart/cart_routes')(router)

//cart 
require('./modules/cart/cart_routes')(router)

//cart 
require('./modules/cart/cart_routes')(router)

//admin setting
 require('./modules/admin_settings/admin_settings_routes')(router)

return router;
}