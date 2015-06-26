'use strict';

var forIn = require('for-in');
var clone = require('clone-deep');
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
  utils.defineProp(this, 'options', clone(options || {}));
  utils.defineProp(this, '_callbacks', this._callbacks);
  utils.defineProp(this, 'app', app);
}

/**
 * Collection methods
 */

utils.defineProps(Collection.prototype, Emitter({

  /**
   * Whitelisted prototype methods.
   */

  whitelist: ['option', 'get', 'set', 'filter', 'use', 'value', 'forOwn'],

  /**
   * Load items.
   */

  wrap: function (options, fn) {
    return fn(this, options);
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

  get: function(key, fn) {
    // use renameKey function, if passed
    if (typeof fn === 'function') {
      key = fn(key);
    }
    if (key in this) {
      return this[key];
    }
    // try again with the default renameKey function
    fn = this.options.renameKey;
    var name;
    if (typeof fn === 'function') {
      name = fn(key);
    }
    if (name && name !== key && name in this) {
      var res = this[name];
      if (res) return res;
    }
    return utils.get(this, key);
  },

  /**
   * Run a plugin on the collection instance.
   */

  use: function (fn) {
    fn.call(this, this, this.options);
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
  },

  /**
   * Mix the given collection methods onto `obj`
   */

  mixin: function (obj, methods) {
    if (!methods) methods = this.whitelist;
    var len = methods.length;

    while (len--) {
      var key = methods[len];
      obj[key] = this[key].bind(this);
    }
  }
}));

/**
 * Expose `Collection`
 */

module.exports = Collection;
