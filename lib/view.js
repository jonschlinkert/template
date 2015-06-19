var util = require('util');
var Record = require('record');
var utils = require('./utils');

function View(file) {
  // Record.call(this, file);
  // this.content = file.content || (file.contents ? file.contents.toString() : null);
  // this.data = file.data || {};

  for (var key in file) {
    if (file.hasOwnProperty(key)) {
      var val = file[key];

      if (typeof val === 'function') {
        this.mixin(key, val.bind(this));
      } else {
        this.mixin(key, val);
      }
    }
  }
}
// util.inherits(View, Record);

View.prototype.mixin = function(key, value) {
  utils.defineProperty(this, key, value);
};

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
