var bookshelf = require('app/config/bookshelf');

module.exports = {
  createUser,
  getUserByUid,
  getUserById,
  updateUser,
};

async function createUser(req, res, next) {
  try {
    const userData = req.body;
    let rows = await bookshelf.knex('users').insert(userData).returning('*');
    if (rows.length > 0) res.status(200).json(rows[0]);
    else res.status(400).json('Failed to create a new user row');
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getUserByUid(req, res, next) {
  try {
    const user_uid = req.body.user_uid;

    let rows = await bookshelf.knex('users').where({ 'users.user_uid': user_uid }).select('*');

    if (rows.length > 0) res.status(200).json(rows[0]);
    else res.status(404).json('No user row found');
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getUserById(req, res, next) {
  try {
    const userId = req.body.id;
    let rows = await bookshelf.knex('users').where({ 'users.id': userId }).select('*');

    if (rows.length > 0) res.status(200).json(rows[0]);
    else res.status(404).json('No user row found');
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function updateUser(req, res, next) {
  try {
    const uid = req.user.uid;
    const userData = req.body;
    await bookshelf
      .knex('users')
      .where({ 'users.user_uid': uid })
      .update({ ...userData });
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
