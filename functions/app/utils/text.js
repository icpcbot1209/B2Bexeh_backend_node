exports.capitalize = _capitalize;
exports.makeEmpty = _makeEmpty;
exports.isUrl = _isUrl;

function _capitalize(text) {
  if (text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  return text;
}


function _makeEmpty(data) {


  if (data instanceof Array) {

    for (var key in data) {
      if (data[key] instanceof Object) {

        data[key] = _makeEmpty(data[key]);

      } else {

        data[key] = data[key] == null ? "" : data[key];
      }
    }
  } else if (data instanceof Object) {

    Object.keys(data).forEach(function (key, i) {

      if (data[key] instanceof Object) {

        data[key] = _makeEmpty(data[key]);

      } else {

        data[key] = data[key] == null ? "" : data[key];
      }
    });

  }

  return data;
}

function _isUrl(str) {
  return new RegExp(/(https?:\/\/[^\s]+)/gi).test(str)
}