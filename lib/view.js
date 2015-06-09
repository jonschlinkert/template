var util = require('util');
var Record = require('record');

function View(obj) {
  Record.call(this, obj);
}
util.inherits(View, Record);

View.prototype.load = function(key, value) {
  return (this[key] = value);
};

View.prototype.save = function(key, fn) {
  return fn(this[key]);
};

/**
 * Expose `View`
 */
module.exports = View;
