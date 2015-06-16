'use strict';


function Collection(options) {
  Object.defineProperty(this, 'options', {
    enumerable: false,
    configurable: true,
    value: options || {}
  });
}

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
