var bookshelf = require('app/config/bookshelf');
var moment = require('moment');
const Hope = require('../models/Hope');

module.exports = {
  createOne,
};

async function createOne(req, res, next) {
  try {
    const creatorId = req.user._id;
    const hopeData = req.body;
    console.log(hopeData);

    const hope = new Hope({ ...hopeData, creatorId });
    const saved = await hope.save();
    console.log(saved);

    res.status(200).json(saved);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal error.' });
  }
}
