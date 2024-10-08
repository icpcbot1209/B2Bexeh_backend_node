var bookshelf = require('app/config/bookshelf');
var { notifyOnOffer, ACTION_TYPES } = require('../notif');

module.exports = {
  getMyOffers,
  createOne,
  getOne,
  accept,
  decline,
  markAsPaid,
  markAsShipped,
  giveFeedback2Seller,
  giveFeedback2Buyer,
  changeTerms,
};

function isActiveOffer(x, user_id) {
  return !x.is_deleted && !((x.seller_id == user_id && x.feedback2buyer) || (x.buyer_id == user_id && x.feedback2seller)) && !x.is_canceled;
}

async function getMyOffers(req, res, next) {
  try {
    const { user_id, tag } = req.body;
    let rows = await bookshelf
      .knex('offers')
      .where({ 'offers.seller_id': user_id })
      .orWhere({ 'offers.buyer_id': user_id })
      .select('offers.*')
      .innerJoin('products', 'offers.product_id', '=', 'products.id')
      .select('products.name as product_name', 'products.category_id', 'products.subcategory_id')
      .innerJoin('hopes', 'hopes.id', '=', 'offers.hope_id');

    if (tag === 'active-received') {
      rows = rows.filter((x) => isActiveOffer(x, user_id) && x.creator_id != user_id);
    } else if (tag === 'closed-received') {
      rows = rows.filter((x) => !isActiveOffer(x, user_id) && x.creator_id != user_id);
    } else if (tag === 'active-sent') {
      rows = rows.filter((x) => isActiveOffer(x, user_id) && x.creator_id == user_id);
    } else if (tag === 'closed-sent') {
      rows = rows.filter((x) => !isActiveOffer(x, user_id) && x.creator_id == user_id);
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function createOne(req, res, next) {
  try {
    const user_uid = req.user.uid;
    const offerData = req.body;

    const rows = await bookshelf.knex('offers').insert(offerData).returning('*');
    const offer = rows[0];

    notifyOnOffer(ACTION_TYPES.offer_created, user_uid, offer);

    res.status(200).json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getOne(req, res, next) {
  try {
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
      .select('products.productName AS product_name');
    res.status(200).json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function accept(req, res, next) {
  try {
    const user_uid = req.user.uid;
    const { offerId } = req.body;
    let rows = await bookshelf.knex('offers').where({ 'offers.id': offerId }).update({ is_accepted: true }).returning('*');

    notifyOnOffer(ACTION_TYPES.offer_accepted, user_uid, rows[0]);

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function decline(req, res, next) {
  try {
    const user_uid = req.user.uid;
    const { offerId } = req.body;
    const rows = await bookshelf.knex('offers').where({ 'offers.id': offerId }).update({ is_canceled: true }).returning('*');

    notifyOnOffer(ACTION_TYPES.offer_declined, user_uid, rows[0]);

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function markAsPaid(req, res, next) {
  try {
    const user_uid = req.user.uid;
    const { offer_id, paid_info } = req.body;
    const paid_at = new Date();
    const rows = await bookshelf.knex('offers').where({ 'offers.id': offer_id }).update({ is_paid: true, paid_at, paid_info }).returning('*');

    notifyOnOffer(ACTION_TYPES.offer_paid, user_uid, rows[0]);

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function markAsShipped(req, res, next) {
  try {
    const user_uid = req.user.uid;
    const { offer_id, shipped_info } = req.body;
    const shipped_at = new Date();
    const rows = await bookshelf
      .knex('offers')
      .where({ 'offers.id': offer_id })
      .update({ is_shipped: true, shipped_at, shipped_info })
      .returning('*');

    notifyOnOffer(ACTION_TYPES.offer_shipped, user_uid, rows[0]);

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function giveFeedback2Seller(req, res, next) {
  try {
    const user_uid = req.user.uid;
    const { offerId, feedback2seller } = req.body;
    await bookshelf.knex('offers').where({ 'offers.id': offerId }).update({ feedback2seller });
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function giveFeedback2Buyer(req, res, next) {
  try {
    const user_uid = req.user.uid;
    const { offerId, feedback2buyer } = req.body;
    await bookshelf.knex('offers').where({ 'offers.id': offerId }).update({ feedback2buyer });
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function changeTerms(req, res, next) {
  try {
    const user_uid = req.user.uid;
    const { offerId, price, qty } = req.body;
    const rows = await bookshelf.knex('offers').where({ 'offers.id': offerId }).update({ price, qty }).returning('*');

    notifyOnOffer(ACTION_TYPES.offer_terms_changed, user_uid, rows[0]);

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
