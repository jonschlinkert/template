var typeOf = require('kind-of');
var BaseError = require('./base');

function assert(methodName, paramName, type, val, cb) {
  if (typeOf(val) === type) return;
  var error = new BaseError(methodName, message(paramName, type), val);

  if (typeof cb === 'function') return cb(error);
  throw error;
}

function message(paramName, type) {
  var article = /^[aeiou]/.test(type) ? 'an' : 'a';
  return 'expects ' + paramName + ' to be ' + article + ' ' + type;
}

/**
 * Expose `assert`
 */
module.exports = assert;
