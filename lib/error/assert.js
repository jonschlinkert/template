var typeOf = require('kind-of');
var BaseError = require('./base');

function assert(name, expected, type, actual, cb) {
  if (typeOf(actual) === type) return;

  var error = new BaseError(name, message(expected, type), actual);
  if (typeof cb === 'function') {
    return cb(error);
  }
  throw error;
};

function message(expected, type) {
  return 'expects ' + expected + ' to be a ' + type + '.';
}

/**
 * Expose `assert`
 */
module.exports = assert;
