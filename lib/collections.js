'use strict';

/**
 * Create an instance of `Collections`.
 *
 * @api public
 */

function Collections() {
  this.views = {};
}

/**
 * Collections methods
 */

Collections.prototype = {
  constructor: Collections,

  set: function (key, value) {
    this.views[key] = value;
    return this;
  },

  get: function (key) {
    return this.views[key];
  },

  use: function (fn) {
    fn.call(this, this.views);
    return this;
  }
};

/**
 * Expose `Collections`
 */

module.exports = Collections;
