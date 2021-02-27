var bookshelf = require('app/config/bookshelf');

module.exports = {
  getCategories,
  getSubategories,
  getSubcategoriesByCate,
  getByCategory,
  getById,
  getWatchlist,
  existInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
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

async function getSubategories(req, res, next) {
  try {
    let rows = await bookshelf.knex('subcategories').select('*').returning('*');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Error' });
  }
}

async function getSubcategoriesByCate(req, res, next) {
  try {
    const { category_id } = req.body;
    let rows = await bookshelf
      .knex('categorymap as CM')
      .where({ 'CM.category_id': category_id })
      .innerJoin('subcategories as SC', 'SC.id', '=', 'CM.subcategory_id')
      .select('SC.id as id', 'SC.name as name')
      .returning('*');

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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getWatchlist(req, res, next) {
  try {
    const { user_id } = req.body;

    var sql = `select p.*,
    MIN(CASE WHEN h.is_ask=true and h.unit='box' THEN h.price END) as boxlowestask,
    MAX(CASE WHEN h.is_ask=false and h.unit='box' THEN h.price END) as boxhighestbid,
    MIN(CASE WHEN h.is_ask=true and h.unit='case' THEN h.price END) as caselowestask,
    MAX(CASE WHEN h.is_ask=false and h.unit='case' THEN h.price END) as casehighestbid
    FROM watchlist w
    INNER JOIN products p ON w.product_id = p.id
    LEFT OUTER JOIN hopes h ON p.id = h.product_id
    WHERE w.user_id= ? 
    GROUP BY p.id, w.updated_at ORDER BY w.updated_at;`;

    const data = await bookshelf.knex.raw(sql, [user_id]);

    res.status(200).json(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function existInWatchlist(req, res, next) {
  try {
    const { user_id, product_id } = req.body;

    const rows = await bookshelf.knex('watchlist').where({ user_id, product_id }).returning('*');
    res.status(200).json(rows.length > 0);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function addToWatchlist(req, res, next) {
  try {
    const { user_id, product_id } = req.body;
    const rows = await bookshelf.knex('watchlist').where({ user_id, product_id }).returning('*');

    if (rows.length > 0) return res.status(200).json({ message: 'OK' });

    await bookshelf.knex('watchlist').insert({ user_id, product_id });

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function removeFromWatchlist(req, res, next) {
  try {
    const { user_id, product_id } = req.body;

    await bookshelf.knex('watchlist').where({ user_id, product_id }).delete();

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
