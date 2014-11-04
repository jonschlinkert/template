'use strict';

var typeOf = require('kind-of');

/**
 * Return `true` if `val` is an object
 *
 * @param  {*} `val`
 * @return {Boolean}
 */

module.exports = function isObject(val) {
  return typeOf(val) === 'object';
};