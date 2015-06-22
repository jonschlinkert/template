'use strict';

var forOwn = require('for-own');
var iterator = require('make-iterator');
var Collections = require('./collections');
var View = require('./view');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views(options, loaders, app) {
  this.options = options || {};
  this.loaders = loaders || [];
  this.app = app;
}

/**
 * Views methods
 */

Views.prototype = {
  constructor: Views,

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
    this[key] = new View(value, this);
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
   * Return filtered
   */

  value: function () {
    return this.cache || this;
  }
};

/**
 * Expose `Views`
 */

module.exports = Views;
