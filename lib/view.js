'use strict';
/**
 * Create an instance of `View`.
 *
 * @api public
 */

function View() {
  this.views = {};
  this.cache = {};
}

/**
 * View methods
 */

View.prototype = {
  constructor: View,

  create: function (name, options, loaders) {
    this[name] = new Views(options, loaders);
  }
};

/**
 * Expose `View`
 */

module.exports = View;
