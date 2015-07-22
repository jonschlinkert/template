'use strict';

var util = require('util');
var Emitter = require('component-emitter');

/**
 * Lazily required dependencies
 */

var lazy = require('lazy-cache')(require);
var clone = lazy('clone-deep');
var forIn = lazy('for-in');
var forOwn = lazy('for-own');
var omit = lazy('object.omit');
var pick = lazy('object.pick');
var visit = lazy('object-visit');
var mapVisit = lazy('map-visit');
var get = lazy('get-value');
var set = lazy('set-value');

/**
 * Local modules
 */

var utils = require('./utils');

/**
 * Create an instance of `Base` with specified `options.
 *
 * The `Base` class extends `Collection`, `List` and `Item`
 * with common methods, properties and behavior.
 *
 * ```js
 * function MyClass(options) {
 *   Base.call(this, options);
 * }
 * Base.extend(MyClass);
 * ```
 * @param {Object} `options`
 * @return {undefined}
 * @api public
 */

function Base(options) {
  utils.defineProp(this, 'options', options || {});
  utils.defineProp(this, 'app', this.app || this.options.app || {});
  utils.defineProp(this, 'data', this.data || {});

  utils.defineProp(this, '_cache', {});
  utils.defineProp(this, '_callbacks', this._callbacks);

  var mixins = this.options.mixins || {};
  for (var key in mixins) {
    if (mixins.hasOwnProperty(key)) {
      utils.defineProp(this, key, mixins[key].bind(this));
    }
  }
}

/**
 *
 * Expose `extend`, static method for allowing other classes to inherit
 * from the `Base` class (and receive all of Base's prototype methods).
 *
 * ```js
 * function MyClass(options) {...}
 * Base.extend(MyClass);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `Base`
 * @return {undefined}
 * @api public
 */

Base.extend = function (obj) {
  util.inherits(obj, Base);
};

/**
 * `Base` prototype methods
 */

Base.prototype = Emitter({
  constructor: Base,

  /**
   * Get a value if it exists, otherwise call the given function
   * and cache the result for subsequent calls.
   */

  fragmentCache: function (key, fn) {
    return this._cache[key] || (this._cache[key] = fn.call(this));
  },

  /**
   * Return a clone of the instance.
   */

  clone: function (keys) {
    var Parent = this.constructor;
    var opts = clone()(this.options);
    var res = new Parent(opts);

    omit()(this, keys, function (val, key) {
      res[key] = clone()(val);
    });
    return res;
  },

  /**
   * Set a value.
   */

  set: function (prop, val) {
    set()(this, prop, val);
    return this;
  },

  /**
   * Get a value.
   */

  get: function (prop) {
    return get()(this, prop);
  },

  /**
   * Set or get an option.
   */

  option: function(key, val) {
    var len = arguments.length;
    if (len === 1 && typeof key === 'string') {
      if (key.indexOf('.') === -1) {
        return this.options[key];
      }
      return get()(this.options, key);
    }

    if (utils.isObject(key)) {
      this.visit('option', key);
      return this;
    }

    set()(this.options, key, val);
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

  pickOption: function(prop) {
    return this.option(prop) || (this.app && this.app.option(prop));
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

  /**
   * Return a clone of item, without the given keys.
   */

  omit: function(keys) {
    keys = [].concat.apply([], arguments);
    return omit()(this.clone(), keys);
  },

  /**
   * Return a clone of item, with only the given keys.
   */

  pick: function(keys) {
    keys = [].concat.apply([], arguments);
    return pick()(this.clone(), keys);
  },

  /**
   * Iterate over the 'own' keys on the object.
   */

  forOwn: function (fn) {
    forOwn()(this, fn, this);
    return this;
  },

  /**
   * Iterate over the keys on the object
   */

  forIn: function (fn) {
    forIn()(this, fn, this);
    return this;
  },

  /**
   * Call the given method on all values in `obj`.
   */

  visit: function (method, obj) {
    visit()(this, method, obj);
    return this;
  },

  /**
   * Map visit over an array of objects.
   */

  mapVisit: function (method, arr) {
    mapVisit()(this, method, arr);
    return this;
  },

  /**
   * Forward the given collection methods onto `obj`
   */

  forward: function (obj, keys) {
    utils.forward(obj, this, keys);
  },

  /**
   * Add a method to the Base prototype
   */

  mixin: function (name, fn) {
    Base.prototype[name] = fn;
  }
});

/**
 * Expose `Base`
 */

module.exports = Base;
