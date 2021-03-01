var bookshelf = require('app/config/bookshelf');

module.exports = {
  readItems,
  updateItem,
};

async function readItems(req, res, next) {
  try {
    const { sortDirection, filter, pageIndex, pageSize } = req.body;
    let countFiltered = (
      await bookshelf.knex('offers AS o').innerJoin('products AS p', 'p.id', '=', 'o.product_id').where('p.name', 'LIKE', `%${filter}%`).count()
    )[0].count;

    let items = await bookshelf
      .knex('offers AS o')
      .innerJoin('products AS p', 'o.product_id', '=', 'p.id')
      .select('o.*', 'p.name AS product_name')
      .where({ 'o.is_paid': true, 'o.is_shipped': true })
      .andWhere('p.name', 'LIKE', `%${filter}%`)
      .orderBy('o.updated_at', sortDirection)
      .offset(pageSize * pageIndex)
      .limit(pageSize);

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      item.seller_name = (await bookshelf.knex('users').select('user_name').where({ id: item.seller_id }))[0].user_name;
      item.buyer_name = (await bookshelf.knex('users').select('user_name').where({ id: item.buyer_id }))[0].user_name;
    }

    res.status(200).json({ items, countFiltered });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function updateItem(req, res, next) {
  try {
    const { itemId, itemData } = req.body;

    let items = await bookshelf.knex('transactions').where('id', '=', itemId).update(itemData).returning('*');

    if (items.length > 0) res.status(200).json(items[0]);
    else res.staus(404).json({ message: 'No item found.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
