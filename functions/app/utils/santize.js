
const striptags = require('striptags');
const validator = require('validator');
exports.striptags = _striptags;
exports.escape = _escape;

validator.extend = function (name, fn) {
  validator[name] = function () {
    var args = Array.prototype.slice.call(arguments);
    args[0] = validator.toString(args[0]);
    return fn.apply(validator, args);
  };
};

function _striptags(attributes) {

  for (var key in attributes) {
    if (typeof (attributes[key]) === 'string') {
      attributes[key] = striptags(attributes[key], ['&', '\/', '-', '+', '-']);
    }
  }
  return attributes;
}


function _escape(attributes) { 
   var matchOperatorsRe = /[|\\{}()[\]^$+*?]/g;
  for (var key in attributes) {
    if (typeof (attributes[key]) === 'string') {
      attributes[key] = validator.escape(attributes[key]);     
      attributes[key] = attributes[key].replace(matchOperatorsRe, '\\$&');
    }
  }
  
  return attributes;
}