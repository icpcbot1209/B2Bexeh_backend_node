var bookshelf = require('app/config/bookshelf');
var moment = require('moment');
const Offer = require('../models/Offer');

module.exports = {
  createOne,
  getOne,
  accept,
  decline,
};

async function createOne(req, res, next) {
  try {
    const creator_id = req.user._id;
    const offerData = req.body;
    const is_active = true;
    const is_accepted = false;

    const data = await bookshelf
      .knex('offers')
      .insert({ ...offerData, creator_id, is_accepted, is_active })
      .returning('*');

    res.status(200).json(data[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getOne(req, res, next) {
  try {
    const creator_id = req.user._id;
    const { offerId } = req.body;
    const data = await bookshelf
      .knex('offers')
      .where({ 'offers.id': offerId })
      .select('offers.*')
      .innerJoin('hopes', 'hopes.id', '=', 'offers.hope_id')
      .select(
        'hopes.is_ask AS hope_is_ask',
        'hopes.unit AS hope_unit',
        'hopes.deal_method AS hope_deal_method',
        'hopes.qty AS hope_qty',
        'hopes.price AS hope_price'
      )
      .innerJoin('products', 'offers.product_id', '=', 'products.id')
      .select('products.productName AS procut_name');

    res.status(200).json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function accept(req, res, next) {
  try {
    const userId = req.user._id;
    const { offerId } = req.body;
    await bookshelf.knex('offers').where({ 'offers.id': offerId }).update({ is_accepted: true });
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function decline(req, res, next) {
  try {
    const userId = req.user._id;
    const { offerId } = req.body;
    await bookshelf.knex('offers').where({ 'offers.id': offerId }).update({ is_accepted: true });
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function createOffer(req, res, next) {
  try {
    const user0_id = req.user._id;
    const { request, product, productType, unit, qty, price, text } = req.body;

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
