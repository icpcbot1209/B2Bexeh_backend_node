var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var config = require('../config/config');
var bookshelf = require('../config/bookshelf');
var loader = require('../api/v1/loader');
var async = require('async');
var fs = require('fs');
var i18n = require("i18n");
var constant = require('../config/constant');
var text = require('./text');
var algorithm = constant.CONFIG.cryptoAlgorithm;
var password = constant.CONFIG.cryptoPassword;
var UserModel = loader.loadModel('/user/models/user_models');

var allowed = [
    '/launch',
    '/gettoken',
    '/speciality/getSpeciality',
    '/user/saveUser',
    '/media/getImages',
    '/case/fetchCase'
];

module.exports = {

    ensureAuthorized: function (req, res, next) {
            // console.log("header----------",req.headers);
            var bearerToken;
            var bearerHeader = req.headers["authorization"] || req.query["api_key"];
            // console.log("bearerHeader ",bearerHeader)
            if (typeof bearerHeader !== 'undefined') {
                var bearer = bearerHeader.split(" ");
                bearerToken = bearer[1];
                req.token = bearerToken;
                // console.log("req.token>>>>",req.token);
                jwt.verify(bearerToken, "B2B", function (err, decoded) {
                    req.user = decoded;
                    // console.log("req.user>>>>>>>>>>",req.user);
                    if (err) {
                        console.log("errro ++++++++++++++++++ ",err)
                        return res.send({
                            code: 401,
                            message: 'Invalid Token!'
                        });
                    }
                    // console.log("Decode ",decoded)
                    next();
                });
            } else {
                return res.send({
                    code: 401,
                    message: 'Token not found!'
                });
            }
        
    
    
    
    },

    encrypt(encText) {
        var cipher = crypto.createCipher(algorithm, password)
        var encText = cipher.update(encText, 'utf8', 'hex')
        encText += cipher.final('hex');
        return encText;
    },

    decrypt(decText) {
        var decipher = crypto.createDecipher(algorithm, password)
        var decText = decipher.update(decText, 'hex', 'utf8')
        decText += decipher.final('utf8');
        return decText;
    }

};

