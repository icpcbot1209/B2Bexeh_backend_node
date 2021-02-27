var bookshelf = require('app/config/bookshelf');

module.exports = {
  getDealmethods,
};

async function getDealmethods(req, res, next) {
  try {
    const arr = await bookshelf.knex('dealmethods').select('*');
    res.status(200).json(arr);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
