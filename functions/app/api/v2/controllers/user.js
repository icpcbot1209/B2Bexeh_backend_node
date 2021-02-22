var bookshelf = require('app/config/bookshelf');

module.exports = {
  getUserById,
  getTenUsers,
  updateUser,
};

async function getUserById(req, res, next) {
  try {
    const userId = req.body.userId;
    const query = `SELECT * FROM users WHERE id=${userId} LIMIT 1`;
    let data = await bookshelf.knex.raw(query);
    res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function getTenUsers(req, res, next) {
  try {
    const query = `SELECT * FROM users LIMIT 300`;
    let data = await bookshelf.knex.raw(query);
    res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = req.user.uid;
    const userData = req.body;
    await bookshelf
      .knex('users')
      .where({ 'users.id': userId })
      .update({ ...userData });
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
