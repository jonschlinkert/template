'use strict';

var util = require('util');
var Loaders = require('./loaders');

function Collection(options, stack) {
  Loaders.call(this, options, stack);
}
util.inherits(Collection, Loaders);

Collection.prototype.use = function(fn) {
  fn(this);
  return this;
};

Collection.prototype.find = function(key) {
  return this[key];
};

/**
 * Expose `Collection`
 */
module.exports = Collection;
