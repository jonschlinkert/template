'use strict';

var util = require('util');
var Emitter = require('component-emitter');
var clone = require('clone-deep');
var get = require('get-value');
var set = require('set-value');
var forIn = require('for-in');
var forOwn = require('for-own');
var omit = require('object.omit');
var pick = require('object.pick');
var visit = require('object-visit');
var mm = require('micromatch');
var utils = require('./utils');

function Base(options) {
  Emitter.call(this);

  utils.defineProp(this, '_cache', {});
  this.options = options || {};
  this.data = this.data || {};

  var mixins = this.options.mixins || {};
  for (var key in mixins) {
    if (mixins.hasOwnProperty(key)) {
      utils.defineProp(this, key, mixins[key].bind(this));
    }
  }
}

Base.extend = function (obj) {
  util.inherits(obj, Base);
};

Base.prototype = Emitter({

  /**
   * Get a value if it exists, otherwise call the given function
   * and cache the result for subsequent calls.
   */

  cache: function (key, fn) {
    return this._cache[key] || (this._cache[key] = fn.call(this));
  },

  /**
   * Return a clone of the instance.
   */

  clone: function (obj, keys) {
    var res = {};
    forOwn(obj || this, function (val, key) {
      res[key] = clone(val);
    });

    if (typeof keys !== 'undefined') {
      return omit(res, keys);
    }
    return res;
  },

  /**
   * Set a value.
   */

  set: function (key, val) {
    set(this, key, val);
    return this;
  },

  /**
   * Get a view.
   */

  get: function(prop, fn) {
    var name, res;
    if (arguments.length === 0) {
      res = {};
      for (var key in this) {
        res[key] = this[key];
      }
      return res;
    }

    // use renameKey function passed on args
    if (typeof fn === 'function') {
      prop = fn(prop);
    }

    if (!!(name = this[prop])) {
      return name;
    }

    // try again with the `renameKey` function
    name = this.renameKey(prop);

    if (name && name !== prop && !!(res = this[name])) {
      res.__proto__ = this;
      return res;
    }

    res = get(this, prop);
    if (!res) {
      res = this.find(prop);
    }

    res.__proto__ = this;
    return res;
  },

  /**
   * Find a view by `key` or glob pattern.
   *
   * @param  {String} `pattern` Key or glob pattern.
   * @param  {Object} `options` Options for [micromatch]
   * @return {Object} Matching view.
   */

  find: function (pattern, options) {
    function find() {
      var isMatch = mm.matcher(pattern, options);
      for (var key in this) {
        var val = this[key];
        if (typeof val === 'object' && isMatch(key)) {
          return val;
        }
      }
    }
    var res = this.cache(pattern, find);
    res.__proto__ = this;
    return res;
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

  pickOption: function(prop) {
    return this.option(prop)
      || this.collection.option(prop)
      || this.app.option(prop)
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
    return omit(this.clone(), keys);
  },

  /**
   * Return a clone of item, with only the given keys.
   */

  pick: function(keys) {
    keys = [].concat.apply([], arguments);
    return pick(this.clone(), keys);
  },

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
    var val = this.stash || this;
    var res = {};
    forIn(this, function (value, key, obj) {
      if (cb(value, key, obj) && key !== 'stash') {
        res[key] = value;
      }
    }, this);
    this.stash = res;
    this.value();
    return this;
  },

  /**
   * Return stash or this with prototype methods.
   */

  value: function () {
    if (this.hasOwnProperty('stash')) {
      utils.delegateAll(this.stash, this.constructor.prototype);
      return this.stash;
    }
    return this;
  },

  /**
   * Call the given method on all values in `obj`.
   */

  visit: function (method, obj) {
    visit(this, method, obj);
    return this;
  },

  /**
   * Map visit over an array of objects.
   */

  mapVisit: function (method, arr) {
    utils.mapVisit(this, method, arr);
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
