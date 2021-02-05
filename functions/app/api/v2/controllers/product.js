var bookshelf = require('app/config/bookshelf');

module.exports = {
  getByCategory,
};

async function getByCategory(req, res, next) {
  try {
    const creator_id = req.user._id;
    const { category_id, subcategory_id } = req.body;

    var sql = `select P.*, i."imageUrl", 
MIN(CASE WHEN t.is_ask=true and t.unit='Box' THEN t.price END) as BoxLowestAsk,
MAX(CASE WHEN t.is_ask=false and t.unit='Box' THEN t.price END) as BoxHighestBid,
MIN(CASE WHEN t.is_ask=true and t.unit='Case' THEN t.price END) as CaseLowestAsk,
MAX(CASE WHEN t.is_ask=false and t.unit='Case' THEN t.price END) as CaseHighestBid
from products P
LEFT OUTER JOIN hopes t on P.id = t.product_id
LEFT OUTER JOIN images i on P.id = i."productId"
where (P."categoryId"= ? AND P."subcategoryId"=? AND P."isdeleted" = false) 
group by P.id, i."imageUrl" order by P."productName" ;`;

    const data = await bookshelf.knex.raw(sql, [category_id, subcategory_id]);

    res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

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
