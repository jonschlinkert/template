'use strict';

var clone = require('clone-deep');
var get = require('get-value');
var set = require('set-value');
var forIn = require('for-in');
var forOwn = require('for-own');
var omit = require('object.omit');
var pick = require('object.pick');
var extend = require('extend-shallow');
var recent = require('recent');
var Emitter = require('component-emitter');
var utils = require('./utils');


function Base(options) {
  Emitter.call(this);
  this.options = options || {};
}


Base.prototype = Emitter({

  /**
   * Return a clone of the instance.
   */

  clone: function (obj) {
    return clone(obj || this);
  },

  // /**
  //  * Set a value.
  //  */

  // set: function(prop, value) {
  //   set(this, prop, value);
  //   return this;
  // },

  // /**
  //  * Get a value.
  //  */

  // get: function(prop) {
  //   return get(this, prop);
  // },

  /**
   * Set or get data.
   */

  // data: function(key, val) {
  //   var len = arguments.length;
  //   if (len === 1 && typeof key === 'string') {
  //     if (key.indexOf('.') === -1) {
  //       return this.cache.data[key];
  //     }
  //     return get(this.cache.data, key);
  //   }

  //   if (utils.isObject(key)) {
  //     this.visit('option', key);
  //     return this;
  //   }

  //   set(this.cache.data, key, val);
  //   this.emit('option', key, val);
  //   return this;
  // },

  /**
   * Set or get an option.
   */

  option: function(key, val) {
    var len = arguments.length;
    if (len === 1 && typeof key === 'string') {
      if (key.indexOf('.') === -1) {
        return this.options[key];
      }
      return get(this.options, key);
    }

    if (utils.isObject(key)) {
      this.visit('option', key);
      return this;
    }

    set(this.options, key, val);
    this.emit('option', key, val);
    return this;
  },

  /**
   * Enable `key`.
   *
   * ```js
   * app.enable('a');
   * ```
   * @param {String} `key`
   * @return {Object} `Options`to enable chaining
   * @api public
   */

  enable: function(key) {
    this.option(key, true);
    return this;
  },

  /**
   * Disable `key`.
   *
   * ```js
   * app.disable('a');
   * ```
   *
   * @param {String} `key` The option to disable.
   * @return {Object} `Options`to enable chaining
   * @api public
   */

  disable: function(key) {
    this.option(key, false);
    return this;
  },

  /**
   * Check if `key` is enabled (truthy).
   *
   * ```js
   * app.enabled('a');
   * //=> false
   *
   * app.enable('a');
   * app.enabled('a');
   * //=> true
   * ```
   *
   * @param {String} `key`
   * @return {Boolean}
   * @api public
   */

  enabled: function(key) {
    return Boolean(this.options[key]);
  },

  /**
   * Check if `key` is disabled (falsey).
   *
   * ```js
   * app.disabled('a');
   * //=> true
   *
   * app.enable('a');
   * app.disabled('a');
   * //=> false
   * ```
   *
   * @param {String} `key`
   * @return {Boolean} Returns true if `key` is disabled.
   * @api public
   */

  disabled: function(key) {
    return !Boolean(this.options[key]);
  },

  /**
   * Get an option from either the view, collection, or app instance,
   * in that order.
   */

  pickOption: function(key) {
    var collection = extend({options: {}}, this.collection);
    var app = extend({options: {}}, this.app);
    return this.options[key]
      || collection.options[key]
      || app.options[key];
  },

  /**
   * Resolves the renaming function to use on `view` keys.
   */

  renameKey: function (key, fn) {
    if (typeof key === 'function') {
      fn = key;
      key = null;
    }
    if (typeof fn !== 'function') {
      fn = this.pickOption('renameKey');
    }
    if (typeof fn !== 'function') {
      fn = utils.identity;
    }

    this.options.renameKey = fn;
    if (arguments.length === 2) {
      return fn(key);
    }
    if (typeof key === 'string') {
      return fn(key);
    }
    return fn;
  },

  /**
   * Run a plugin on the collection instance.
   */

  use: function (fn) {
    fn.call(this, this, this.options);
    return this;
  },

  // /**
  //  * Return a clone of item, without the given keys.
  //  */

  // omit: function(keys) {
  //   keys = [].concat.apply([], arguments);
  //   return omit(this.clone(), keys);
  // },

  // /**
  //  * Return a clone of item, with only the given keys.
  //  */

  // pick: function(keys) {
  //   keys = [].concat.apply([], arguments);
  //   return pick(this.clone(), keys);
  // },

  /**
   * Iterate over the 'own' keys on the collection.
   */

  forOwn: function (fn) {
    forOwn(this, fn, this);
    return this;
  },

  /**
   * Filter views in the collection.
   */

  forIn: function (cb) {
    var res = {};
    forIn(this, function (value, key, obj) {
      if (cb(value, key, obj) && key !== 'stash') {
        res[key] = value;
      }
    }, this);
    this.stash = res;
    return this;
  },

  // /**
  //  * Return collection items sorted by the given property.
  //  */

  // sortBy: function (prop, fn) {
  //   if (typeof prop === 'function') {
  //     fn = prop;
  //     prop = undefined;
  //   }
  //   fn = fn || get;
  //   var keys = [];
  //   var obj = {};
  //   var sortBy = {};

  //   for (var key in this) {
  //     var val = this[key];
  //     var item = fn(val, prop);
  //     sortBy[item] = key;
  //     keys.push(item);
  //     obj[key] = val;
  //   }

  //   keys.sort();
  //   var len = keys.length, i = 0;
  //   var res = {};
  //   while (len--) {
  //     var k = sortBy[keys[i++]];
  //     res[k] = obj[k];
  //   }
  //   return res;
  // },

  // /**
  //  * Return the most recent items from a collection. By default, one of
  //  * the following properties will be used for sorting, and in the order
  //  * specified: `key`, `path`, or `data.date`.
  //  *
  //  * @param  {String} `prop` The property to sort by.
  //  * @param  {String|Object|Array|Function} `pattern` Function, glob patterns, object, array, or string pattern to use for pre-filtering files.
  //  * @param  {Object} `options` Options to pass to [micromatch] if glob patterns are used.
  //  * @return {Object}
  //  */

  // recent: function(prop, pattern, options) {
  //   var obj = {};
  //   for (var key in this) {
  //     obj[key] = this[key];
  //   }
  //   var res = recent(obj, options);
  //   res.__proto__ = this;
  //   return res;
  // },

  // /**
  //  * Return filtered
  //  */

  // value: function () {
  //   return this.stash || this;
  // },

  /**
   * Add a method to the Base prototype
   */

  mixin: function (name, fn) {
    Base.prototype[name] = fn;
  },

  /**
   * Call the given method on all values in `obj`.
   */

  visit: function (method, obj) {
    utils.visit(this, method, obj);
    return this;
  },

  /**
   * Map visit over an array of objects.
   */

  mapVisit: function (method, arr) {
    utils.mapVisit(this, method, arr);
    return this;
  }
});


/**
 * Expose `Base`
 */

module.exports = Base;
