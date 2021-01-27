var bookshelf = __rootRequire('app/config/bookshelf');
var moment = require('moment');

module.exports = {
  createOffer,
};

async function createOffer(req, res, next) {
  try {
    const user0_id = req.user._id;
    const { request, product, productType, unit, qty, price, text } = req.body;
    var createdAt = `${moment().utc().format('YYYY-MM-DD')}`;

    const query = `INSERT INTO bid_and_ask (
      "productId", 
      producttype,
      amount,
      isdeleted,
      "createdAt",
      "createdbyId", 
      request, 
      note, 
      "maxQuantity", 
      "minQuantity", 
      type,
      isactive, 
      isaddtocart, 
      "isPrivate"
    ) VALUES (
      '${product.id}', 
      '${productType}', 
      '${price}', 
      'false',
      '${createdAt}',
      '${user0_id}',
      '${request}',
      '${text}',
      '${qty}',
      '${qty}',
      '${unit}',
      'false',
      'false',
      'false'
    )
    RETURNING *;`;

    let data = await bookshelf.knex.raw(query);
    const arr = data['rows'];
    if (!arr || arr.length === 0) return;
    res.status(200).json(arr[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
