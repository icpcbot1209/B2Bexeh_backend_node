var bookshelf = require('app/config/bookshelf');
var moment = require('moment');
const Hope = require('../models/Hope');

module.exports = {
  createOne,
  readByProductId,
};

async function createOne(req, res, next) {
  try {
    const creator_id = req.user._id;
    const hopeData = req.body;

    const data = await bookshelf.knex
      .from('hopes')
      .insert({ ...hopeData, creator_id })
      .returning('*');

    res.status(200).json(data[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function readByProductId(req, res, next) {
  try {
    const product_id = req.body.product_id;
    const arr = await bookshelf.knex
      .from('hopes')
      .where({ 'hopes.product_id': product_id })
      .innerJoin('users', 'hopes.creator_id', 'users.id')
      .select('hopes.*', 'users.user_name');
    res.status(200).json(arr);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
