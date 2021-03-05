var bookshelf = require('app/config/bookshelf');

module.exports = {
  createOne,
  updateOne,
  deleteOne,
  readByProductId,
  getByCategory,
  getMyHopes,
};

async function createOne(req, res, next) {
  try {
    const hopeData = req.body;
    const rows = await bookshelf.knex('hopes').insert(hopeData).returning('*');
    if (rows.length > 0) res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function updateOne(req, res, next) {
  try {
    const { hopeData, hopeId } = req.body;

    await bookshelf
      .knex('hopes')
      .where({ 'hopes.id': hopeId })
      .update({ ...hopeData })
      .returning('*');

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function deleteOne(req, res, next) {
  try {
    const { hopeId } = req.body;

    await bookshelf.knex('hopes').where('hopes.id', '=', hopeId).delete();

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
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
      .select('hopes.*', 'users.user_name as dealer_name');
    res.status(200).json(arr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getByCategory(req, res, next) {
  try {
    const { category_id, subcategory_id } = req.body;
    const arr = await bookshelf.knex
      .from('hopes')
      .innerJoin('products', 'hopes.product_id', '=', 'products.id')
      .where({ 'products.category_id': category_id, 'products.subcategory_id': subcategory_id })
      .innerJoin('users', 'hopes.creator_id', 'users.id')
      .select(
        'hopes.*',
        'users.user_name as dealer_name',
        'products.name as product_name',
        'products.release_date as release_date',
        'products.category_id',
        'products.subcategory_id'
      );
    res.status(200).json(arr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getMyHopes(req, res, next) {
  try {
    const { user_id, is_ask } = req.body;
    const arr = await bookshelf.knex
      .from('hopes')
      .where({ 'hopes.creator_id': user_id, 'hopes.is_ask': is_ask })
      .innerJoin('products', 'hopes.product_id', '=', 'products.id')
      .select('hopes.*', 'products.name as product_name', 'products.category_id', 'products.subcategory_id', 'products.release_date as release_date');
    res.status(200).json(arr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
