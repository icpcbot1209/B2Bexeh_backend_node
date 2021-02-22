var bookshelf = require('app/config/bookshelf');

module.exports = {
  getByUserUid,
};

async function getByUserUid(req, res, next) {
  try {
    const { user_uid } = req.body;
    let data = await bookshelf.knex('profiles').where({ 'profiles.user_uid': user_uid }).select('*');
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
