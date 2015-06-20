'use strict';

var typeOf = require('kind-of');
var BaseError = require('./base');

/**
 * Assert the `expectedType` for `prop`, throw or return an error if false.
 *
 * @param  {String} `methodName` The method on `Template` where `.assert` is being called
 * @param  {String} `paramName` The name of the parameter being checked
 * @param  {String} `extpectedType`
 * @param  {*} `actualValue`
 * @param  {Function} `cb` Optional callback
 * @return {Object}
 */

module.exports = function assert(methodName, paramName, extpectedType, actualValue, cb) {
  if (typeOf(actualValue) === extpectedType) {
    return;
  }
  var msg = message(paramName, extpectedType);
  var error = new BaseError(methodName, msg, actualValue);
  if (typeof cb === 'function') {
    return cb(error);
  }
  throw error;
};

/**
 * Format the message
 */

function message(prop, type) {
  var article = /^[aeiou]/.test(type) ? 'an' : 'a';
  return 'expects ' + prop
    + ' to be ' + article
    + ' ' + type;
}
