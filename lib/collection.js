var View = require('./view');
var util = require('util');

function Collection(options) {
  options = options || {};
}

Collection.prototype.load = function(key) {
  for (var key in items) {
    this[key] = new View(items[key]);
  }
  return this;
};

// Collection.prototype.load = function(key, value) {
//   this[key] = new View(value);
//   return this;
// };

// just add a middleware
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
