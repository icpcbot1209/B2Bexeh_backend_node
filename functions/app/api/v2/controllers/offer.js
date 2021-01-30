var bookshelf = require('app/config/bookshelf');
var moment = require('moment');
const Offer = require('../models/Offer');

module.exports = {
  createOffer,
};

async function createOffer(req, res, next) {
  try {
    const user0_id = req.user._id;
    const { request, product, productType, unit, qty, price, text } = req.body;
    const offer_type = request;

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

async function acceptOffer(req, res, next) {
  try {
    const userId = req.user._id;
    const query = `SELECT * FROM users WHERE id=${userId} LIMIT 1`;
    let data = await bookshelf.knex.raw(query);
    res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
