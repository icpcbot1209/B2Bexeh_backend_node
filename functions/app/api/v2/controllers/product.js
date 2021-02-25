var bookshelf = require('app/config/bookshelf');

module.exports = {
  getCategories,
  getSubcategories,
  getByCategory,
  getById,
};

async function getCategories(req, res, next) {
  try {
    let rows = await bookshelf.knex('categories').select('*').returning('*');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Error' });
  }
}

async function getSubcategories(req, res, next) {
  try {
    const { category_id } = req.body;
    let rows = await bookshelf
      .knex('categorymap as CM')
      .where({ 'CM.category_id': category_id })
      .innerJoin('subcategories as SC', 'SC.id', '=', 'CM.subcategory_id')
      .select('SC.id as id', 'SC.name as name')
      .returning('*');

    console.log(rows);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Error' });
  }
}

async function getByCategory(req, res, next) {
  try {
    const creator_id = req.user.uid;
    const { category_id, subcategory_id } = req.body;

    var sql = `select p.*, 
    MIN(CASE WHEN h.is_ask=true and h.unit='box' THEN h.price END) as boxlowestask,
    MAX(CASE WHEN h.is_ask=false and h.unit='box' THEN h.price END) as boxhighestbid,
    MIN(CASE WHEN h.is_ask=true and h.unit='case' THEN h.price END) as caselowestask,
    MAX(CASE WHEN h.is_ask=false and h.unit='case' THEN h.price END) as casehighestbid
    FROM products p 
    LEFT OUTER JOIN hopes h ON p.id = h.product_id
    WHERE (p.category_id= ? AND p.subcategory_id=?) 
    GROUP BY p.id ORDER BY p.name;`;

    const data = await bookshelf.knex.raw(sql, [category_id, subcategory_id]);

    res.status(200).json(data.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getById(req, res, next) {
  try {
    const creator_id = req.user.uid;
    const { id } = req.body;

    var sql = `select p.*, 
    MIN(CASE WHEN h.is_ask=true and h.unit='box' THEN h.price END) as boxlowestask,
    MAX(CASE WHEN h.is_ask=false and h.unit='box' THEN h.price END) as boxhighestbid,
    MIN(CASE WHEN h.is_ask=true and h.unit='case' THEN h.price END) as caselowestask,
    MAX(CASE WHEN h.is_ask=false and h.unit='case' THEN h.price END) as casehighestbid
    FROM products p 
    LEFT OUTER JOIN hopes h ON p.id = h.product_id
    WHERE p.id= ? 
    GROUP BY p.id ORDER BY p.name;`;

    const data = await bookshelf.knex.raw(sql, [id]);
    if (data.rows.length > 0) res.status(200).json(data.rows[0]);
    else res.status(200).json(null);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function createOne(req, res, next) {
  try {
    const creator_id = req.user.uid;
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
