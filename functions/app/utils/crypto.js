var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var constant = require('../config/constant');
var algorithm = constant.CONFIG.cryptoAlgorithm;
var password = constant.CONFIG.cryptoPassword;

module.exports = {
  ensureAuthorized: function (req, res, next) {
    // console.log("header----------",req.headers);
    var bearerToken;
    var bearerHeader = req.headers['authorization'] || req.query['api_key'];
    // console.log("bearerHeader ",bearerHeader)
    if (typeof bearerHeader !== 'undefined') {
      var bearer = bearerHeader.split(' ');
      bearerToken = bearer[1];
      req.token = bearerToken;
      // console.log("req.token>>>>",req.token);
      jwt.verify(bearerToken, 'B2B', function (err, decoded) {
        req.user = decoded;
        // console.log("req.user>>>>>>>>>>",req.user);
        if (err) {
          console.log('errro ++++++++++++++++++ ', err);
          return res.send({
            code: 401,
            message: 'Invalid Token!',
          });
        }
        // console.log("Decode ",decoded)
        next();
      });
    } else {
      return res.send({
        code: 401,
        message: 'Token not found!',
      });
    }
  },

  encrypt(encText) {
    var cipher = crypto.createCipher(algorithm, password);
    var encText = cipher.update(encText, 'utf8', 'hex');
    encText += cipher.final('hex');
    return encText;
  },

  decrypt(decText) {
    var decipher = crypto.createDecipher(algorithm, password);
    var decText = decipher.update(decText, 'hex', 'utf8');
    decText += decipher.final('utf8');
    return decText;
  },
};
