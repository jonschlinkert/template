var View = require('./view');
var util = require('util');

function Collection(options) {
  options = options || {};
}

Collection.prototype.load = function(key, value) {
  return (this[key] = new View(value));
};

Collection.prototype.find = function(key) {
  return this[key];
};

/**
 * Expose `Collection`
 */
module.exports = Collection;
