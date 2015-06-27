'use strict';

/**
 * Array utils.
 */

var utils = module.exports;

utils.flatten = require('arr-flatten');

/**
 * Cast `val` to an array.
 */

utils.arrayify = function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};
