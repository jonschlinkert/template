'use strict';

var forIn = require('for-in');
var Emitter = require('component-emitter');
var iterator = require('make-iterator');
var utils = require('./utils');

/**
 * Create an instance of `Collections`.
 *
 * @api public
 */

function Collections(options, loaders, app) {
  Emitter.call(this);
  this.options = options || {};
  this.loaders = loaders || {};
  utils.defineProp(this, 'app', app);
}

Emitter(Collections.prototype);

/**
 * Collections methods
 */

utils.defineProps(Collections.prototype, {

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
   * Set or get an option on the collection.
   */

  option: function (prop, value) {
    if (typeof prop === 'object') {
      for (var key in prop) {
        if (prop.hasOwnProperty(key)) {
          this.option(key, prop[key]);
        }
      }
    } else {
      this.options[prop] = value;
      this.emit('option', prop, value);
    }
    return this;
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
    forIn(this, function (value, key, obj) {
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
});

/**
 * Expose `Collections`
 */

module.exports = Collections;
