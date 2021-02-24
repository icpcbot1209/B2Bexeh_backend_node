var bookshelf = require('app/config/bookshelf');
const firebase = require('app/config/my-firebase');

module.exports = {
  readItems,
  updateItem,
  deleteItem,
};

async function readItems(req, res, next) {
  try {
    const { sortDirection, filter, pageIndex, pageSize } = req.body;

    let countFiltered = (await bookshelf.knex('users').where('user_name', 'LIKE', `%${filter}%`).count())[0].count;

    let items = await bookshelf
      .knex('users')
      .where('user_name', 'LIKE', `%${filter}%`)
      .orderBy('user_name', sortDirection)
      .offset(pageIndex * pageSize)
      .limit(pageSize)
      .select('*');

    res.status(200).json({ items, countFiltered });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function updateItem(req, res, next) {
  try {
    const { itemId, itemData } = req.body;

    let items = await bookshelf.knex('users').where('id', '=', itemId).update(itemData).returning('*');

    if (items.length > 0) res.status(200).json(items[0]);
    else res.staus(404).json({ message: 'No item found.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function deleteItem(req, res, next) {
  try {
    const { item } = req.body;
    console.log(item);
    await firebase.auth().deleteUser(item.user_uid);

    await bookshelf.knex('users').where('id', '=', item.id).delete();

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
