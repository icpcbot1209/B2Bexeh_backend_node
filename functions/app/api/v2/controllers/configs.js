var bookshelf = require('app/config/bookshelf');

module.exports = {
  createOne,
  readAll,
};

async function createOne(req, res, next) {
  try {
    const creator_id = req.user._id;
    const { json_key, json_value } = req.body;

    const rows = await bookshelf.knex('configs').insert({ creator_id, json_key, json_value }).returning('*');

    res.status(200).json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function readAll(req, res, next) {
  try {
    const arr = await bookshelf.knex('configs').select('*');
    res.status(200).json(arr);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getByCategory(req, res, next) {
  try {
    const { category_id, subcategory_id } = req.body;
    const arr = await bookshelf.knex
      .from('hopes')
      .innerJoin('products', 'hopes.product_id', '=', 'products.id')
      .where({ 'products.categoryId': category_id, 'products.subcategoryId': subcategory_id })
      .innerJoin('users', 'hopes.creator_id', 'users.id')
      .select('hopes.*', 'users.user_name as dealer_name', 'products.productName as product_name', 'products.releaseDate as release_date');
    res.status(200).json(arr);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
