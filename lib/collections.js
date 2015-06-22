'use strict';

var forOwn = require('for-own');
var iterator = require('make-iterator');
var View = require('./view');

/**
 * Create an instance of `Collections`.
 *
 * @api public
 */

function Collections(options) {
  this.options = options || {};
  this.app = this.options.app;
}

/**
 * Collections methods
 */

Collections.prototype = {
  constructor: Collections,

  /**
   * Load views.
   */

  load: function (key, value) {
    return this.set.apply(this, arguments);
  },

  /**
   * Set a view.
   */

  set: function (key, value) {
    this[key] = value;
    return this;
  },

  /**
   * Get a view.
   */

  get: function (key) {
    return this[key];
  },

  /**
   * Run a plugin on the collection instance.
   */

  use: function (fn) {
    fn.call(this, this);
    return this;
  },

  /**
   * Filter views in the collection.
   */

  filter: function (cb) {
    cb = iterator(cb, this);
    var res = {};
    forOwn(this, function (value, key, obj) {
      if (cb(value, key, obj) && key !== 'cache') {
        res[key] = value;
      }
    });
    this.cache = res;
    return this;
  },

  /**
   * Return filtered results.
   */

  value: function () {
    return this.cache || this;
  }
};

/**
 * Expose `Collections`
 */

module.exports = Collections;
