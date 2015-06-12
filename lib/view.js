var util = require('util');
var Record = require('record');

function View(file) {
  Record.call(this, file);
  this.content = file.content || (file.contents ? file.contents.toString() : null);
  this.data = file.data || {};
}
util.inherits(View, Record);

// View.prototype.load = function(key, value) {
//   return (this[key] = value);
// };

// View.prototype.src = function(key, value) {
//   return (this[key] = value);
// };

// View.prototype.use = function(fn) {
//   fn(this);
//   return this;
// };

// View.prototype.save = function(key, fn) {
//   return fn(this[key]);
// };

/**
 * Expose `View`
 */
module.exports = View;
