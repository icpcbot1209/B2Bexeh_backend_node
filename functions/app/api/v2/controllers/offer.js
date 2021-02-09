var bookshelf = require('app/config/bookshelf');

module.exports = {
  getMyOffers,
  createOne,
  getOne,
  accept,
  decline,
};

async function getMyOffers(req, res, next) {
  try {
    const user_id = req.user._id;
    const { tag } = req.body;
    let rows = await bookshelf
      .knex('offers')
      .where({ 'offers.seller_id': user_id })
      .orWhere({ 'offers.buyer_id': user_id })
      .select('offers.*')
      .innerJoin('products', 'offers.product_id', '=', 'products.id')
      .select('products.productName as product_name')
      .innerJoin('hopes', 'hopes.id', '=', 'offers.hope_id')
      .select('hopes.unit as hope_unit');

    if (tag === 'active-received') {
      rows = rows.filter((x) => x.is_active && x.creator_id != user_id);
    } else if (tag === 'closed-received') {
      rows = rows.filter((x) => !x.is_active && x.creator_id != user_id);
    } else if (tag === 'active-sent') {
      rows = rows.filter((x) => x.is_active && x.creator_id == user_id);
    } else if (tag === 'closed-sent') {
      rows = rows.filter((x) => !x.is_active && x.creator_id == user_id);
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function createOne(req, res, next) {
  try {
    const creator_id = req.user._id;
    const offerData = req.body;

    const data = await bookshelf
      .knex('offers')
      .insert({ ...offerData, creator_id })
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
    console.log(data[0]);
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
