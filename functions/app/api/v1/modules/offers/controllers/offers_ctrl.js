var bookshelf = __rootRequire('app/config/bookshelf');

module.exports = {
  getMyOffers,
  getLatestOffers,
  getOffersByProductId,
};

async function getOffersByProductId(req, res) {
  try {
    let { productId } = req.body;
    let query = `
    SELECT o.*, 
    d.user_name AS dealer_name,
    o.producttype AS product_type
    FROM bid_and_ask o
    LEFT OUTER JOIN users d ON d.id=o."createdbyId"
    WHERE (
      o."productId"=${productId}
    )
    `;

    let data = await bookshelf.knex.raw(query);
    res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getLatestOffers(req, res) {
  try {
    let { categoryId, subcategoryId } = req.body;

    let query = `
    SELECT o.*, 
    d.user_name AS dealer_name,
    p."productName" AS product_name,
    o.producttype AS product_type,
    c."categoryName" AS sport_name,
    p."releaseDate" as release_date
    FROM bid_and_ask o
    LEFT OUTER JOIN products p ON p.id=o."productId"
    LEFT OUTER JOIN users d ON d.id=o."createdbyId"
    LEFT OUTER JOIN category c ON c.id=p."categoryId"
    WHERE (
      p."categoryId"=${categoryId}
    ) AND (
      p."subcategoryId"=${subcategoryId}
    )
    `;

    let data = await bookshelf.knex.raw(query);
    res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getMyOffers(req, res) {
  try {
    let userId = req.body.userId;
    let tag = req.body.tag;

    let data = await bookshelf.knex.raw(makeQuery(userId, tag));
    res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
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

  if (tag === 'active-received') return my_received_active;
  if (tag === 'closed-received') return my_received_closed;
  if (tag === 'active-sent') return my_sent_active;
  if (tag === 'closed-sent') return my_sent_closed;

  //   !offer.track_no &&
  //     (!offer.bidder_feedback || !offer.seller_feedback) &&
  //     offer.is_deleted == false &&
  //     expire_date > currentDate &&
  //     offer.type_of == "bid";
}
