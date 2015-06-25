'use strict';

var forIn = require('for-in');
var Emitter = require('component-emitter');
var iterator = require('make-iterator');
var shared = require('./shared');
var utils = require('./utils');

/**
 * Create an instance of `Collection`.
 *
 * @api public
 */

function Collection(options, loaders, app) {
  Emitter.call(this);
  utils.defineProp(this, 'options', options || {});
  utils.defineProp(this, 'loaders', loaders || {});
  utils.defineProp(this, '_callbacks', this._callbacks);
  utils.defineProp(this, 'app', app);
}

Emitter(Collection.prototype);

/**
 * Collection methods
 */

utils.defineProps(Collection.prototype, {

  /**
   * Load views.
   */

  load: function (key, value) {
    return this.set.apply(this, arguments);
  },

  /**
   * Set or get an option on the collection.
   */

  option: function (prop, value) {
    return shared.option(this, prop, value);
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
    fn.call(this, this, this.options, this.loaders);
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
  },

  /**
   * Call the given method on each value in `obj`.
   */

  visit: function (prop, obj) {
    return utils.visit(this, prop, obj);
  }
});

/**
 * Expose `Collection`
 */

module.exports = Collection;
