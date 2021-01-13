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
    let userId = req.body.userId;
    let tag = req.body.tag;

    let data = await bookshelf.knex.raw(makeQuery(userId, tag));
    res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal error." });
  }
}

function makeQuery(userId, tag) {
  let currentDate = new Date().toISOString();

  let select = `SELECT c.*, 
  s.user_name AS seller_name,
  b.user_name AS bidder_name,
  p."productName" AS product_name
  FROM counters c
  LEFT OUTER JOIN products p ON p.id=c.product_id
  LEFT OUTER JOIN users s ON s.id=c.seller_id
  LEFT OUTER JOIN users b ON b.id=c.bidder_id
  LEFT OUTER JOIN feedbacks f ON f.counters_id=c.id`;

  let my_received_active = `${select}
  WHERE (
    (c.type_of='ask' AND c.seller_id=${userId})
    OR
    (c.type_of='bid' AND c.bidder_id=${userId})
  ) 
  AND (
    c.is_deleted=false
    AND c.expiry_date>'${currentDate}'
    AND (f.feedback_by_seller=null OR f.feedback_by_bidder=null)
  )
  `;

  let my_received_closed = `
  ${select}
  WHERE (
    (c.type_of='ask' AND c.seller_id=${userId})
    OR
    (c.type_of='bid' AND c.bidder_id=${userId})
  ) 
  AND NOT (
    c.is_deleted=false
    AND c.expiry_date>'${currentDate}'
    AND (f.feedback_by_seller=null OR f.feedback_by_bidder=null)
  )
  `;

  let my_sent_active = `
  ${select}
  WHERE (
    (c.type_of='ask' AND c.bidder_id=${userId})
    OR
    (c.type_of='bid' AND c.seller_id=${userId})
  ) 
  AND (
    c.is_deleted=false
    AND c.expiry_date>'${currentDate}'
    AND (f.feedback_by_seller=null OR f.feedback_by_bidder=null)
  )
  `;

  let my_sent_closed = `
  ${select}
  WHERE (
    (c.type_of='ask' AND c.bidder_id=${userId})
    OR
    (c.type_of='bid' AND c.seller_id=${userId})
  ) 
  AND NOT (
    c.is_deleted=false
    AND c.expiry_date>'${currentDate}'
    AND (f.feedback_by_seller=null OR f.feedback_by_bidder=null)
  )
  `;

  if (tag === "active-received") return my_received_active;
  if (tag === "closed-received") return my_received_closed;
  if (tag === "active-sent") return my_sent_active;
  if (tag === "closed-sent") return my_sent_closed;

  //   !offer.track_no &&
  //     (!offer.bidder_feedback || !offer.seller_feedback) &&
  //     offer.is_deleted == false &&
  //     expire_date > currentDate &&
  //     offer.type_of == "bid";
}
