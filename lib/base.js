'use strict';

var util = require('util');
var Emitter = require('component-emitter');
var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('extend-shallow', 'extend');
lazy('collection-visit', 'visit');
lazy('clone-deep', 'clone');
lazy('for-in', 'forIn');
lazy('for-own', 'forOwn');
lazy('object.omit', 'omit');
lazy('object.pick', 'pick');
lazy('get-value', 'get');
lazy('set-value', 'set');

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
  this.define('options', options || {});
  this.define('hints', this.hints || {});
  this.define('data', this.data || {});
  this.define('app', this.app || this.options.app || {});
  this.define('_cache', {});
  this.define('_callbacks', this._callbacks);

  if (typeof this.options.mixins === 'object') {
    this.visit('mixin', this.options.mixins);
  }
}

/**
 * `Base` prototype methods
 */

Base.prototype = Emitter({
  constructor: Base,

  /**
   * Get a value if it exists, otherwise call the given function
   * and cache the result and return it on subsequent calls.
   *
   * @param  {String} `key`
   * @param  {any} `val`
   * @return {any}
   * @api public
   */

  fragmentCache: function (key, val) {
    if (this._cache[key]) {
      return this._cache[key];
    }
    if (typeof val === 'function') {
      val = val.call(this);
    }
    return (this._cache[key] = val);
  },

  /**
   * Return a clone of the instance.
   *
   * ```js
   * var foo = app.clone();
   * ```
   * @param  {Array} keys Optionally pass an array of keys to omit.
   * @return {Object}
   * @api public
   */

  clone: function (keys) {
    var Parent = this.constructor;
    var opts = lazy.clone(this.options);
    var res = new Parent(opts);

    lazy.omit(this, keys, function (val, key) {
      res[key] = lazy.clone(val);
    });
    return res;
  },

  /**
   * Set a non-enumerable "hint".
   *
   * @param  {String} `key`
   * @return {any}
   */

  hint: function (key, val) {
    if (arguments.length === 1) {
      return this.hints[key];
    }
    this.hints[key] = val;
    return this;
  },

  /**
   * Assign `value` to `key`.
   *
   * ```js
   * app.set(key, value);
   * ```
   *
   * @param {String} `key`
   * @param {*} `value`
   * @return {Object} `app` instance, to enable chaining
   * @api public
   */

  set: function (prop, val) {
    lazy.set(this, prop, val);
    return this;
  },

  /**
   * Get the value of `key`.
   *
   * ```js
   * app.get(key);
   * ```
   *
   * @param {String} `key`
   * @return {any}
   * @api public
   */

  get: function (prop) {
    return lazy.get(this, prop);
  },

  /**
   * Set or get an option.
   */

  option: function(key, val) {
    var len = arguments.length;
    if (typeof key === 'string' && len === 1) {
      return lazy.get(this.options, key);
    }

    if (typeof key === 'object') {
      this.visit('option', key);
      return this;
    }

    lazy.set(this.options, key, val);
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
   *
   * @param  {String} prop Property name. Dot notation may be used.
   * @return {any}
   * @api public
   */

  pickOption: function(prop) {
    var opt = this.option(prop);
    if (typeof opt === 'undefined') {
      return this.app && this.app.option ? this.app.option(prop) : null;
    }
    return opt;
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
    return lazy.omit(this.clone(), keys);
  },

  /**
   * Return a clone of item, with only the given keys.
   */

  pick: function(keys) {
    keys = [].concat.apply([], arguments);
    return lazy.pick(this.clone(), keys);
  },

  /**
   * Iterate over the 'own' keys on the object.
   */

  forOwn: function (fn) {
    lazy.forOwn(this, fn, this);
    return this;
  },

  /**
   * Iterate over the keys on the object
   */

  forIn: function (fn) {
    lazy.forIn(this, fn, this);
    return this;
  },

  /**
   * Call the given method on all values in `obj`.
   */

  visit: function (method, obj) {
    lazy.visit(this, method, obj);
    return this;
  },

  /**
   * Forward the given collection methods onto `obj`
   */

  forward: function (obj, keys) {
    utils.forward(obj, this, keys);
  },

  /**
   * Define a non-enumerable property on the instance.
   *
   * @param  {String} `key` The property name.
   * @param  {any} `value` Property value.
   * @return {Object} Returns the instance for chaining.
   */

  define: function (key, value) {
    utils.defineProp(this, key, value);
    return this;
  },

  /**
   * Define a non-enumerable property on the instance options.
   *
   * @param  {String} `key` The option name.
   * @param  {any} `value` Option value.
   * @return {Object} Returns the instance for chaining.
   */

  defineOption: function (key, value) {
    utils.defineProp(this.options, key, value);
    return this;
  },

  /**
   * Add a method to the Base prototype
   */

  mixin: function (name, fn) {
    Base.prototype[name] = fn;
  }
});

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

Base.extend = function (Ctor) {
  util.inherits(Ctor, Base);
  lazy.extend(Ctor, Base);
};

/**
 * Expose `Base`
 */

module.exports = Base;
