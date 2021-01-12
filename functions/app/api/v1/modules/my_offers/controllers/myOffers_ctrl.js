var bookshelf = __rootRequire("app/config/bookshelf");
var loader = __rootRequire("app/api/v1/loader");

var CategoryModel = loader.loadModel("/category/models/category_models");

var constant = require("../../../../../utils/constants");
var common_query = require("../../../../../utils/commonQuery");
var Response = require("../../../../../utils/response");
const uuidv4 = require("uuid/v4");

module.exports = {
  getMyOffers: getMyOffers,
};

async function getMyOffers(req, res) {
  try {
    let arr = ["offer"];
    res.status(200).json({ data: arr });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal error." });
  }
}
