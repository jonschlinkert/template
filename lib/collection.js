'use strict';

var forIn = require('for-in');
var forOwn = require('for-own');
var Emitter = require('component-emitter');
var get = require('get-value');
var set = require('set-value');
var utils = require('./utils');

/**
 * Create an instance of `Collection`.
 *
 * @api public
 */

function Collection(app, loaders, options) {
  Emitter.call(this);
  utils.defineProp(this, 'options', options);
  utils.defineProp(this, '_callbacks', this._callbacks);
  utils.defineProp(this, 'app', app);
}

/**
 * Collection methods
 */

utils.object.delegate(Collection.prototype, Emitter({

  /**
   * Set a view.
   */

  set: function (prop, value) {
    var key = this.renameKey(prop);
    set(this, key, value);
    return this;
  },

  /**
   * Get a view.
   */

  get: function(prop, fn) {
    if (arguments.length === 0) {
      var res = {};
      for (var key in this) {
        res[key] = this[key];
      }
      return res;
    }

    var name, res;
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
      return res;
    }
    return get(this, prop);
  },

  /**
   * Set or get data on the collection.
   */

  data: function (prop, value) {
    utils.data(this, prop, value);
    return this;
  },

  /**
   * Set or get an option on the collection.
   */

  option: function (prop, value) {
    utils.option(this, prop, value);
    return this;
  },

  /**
   * Get an option from either the view, collection, or app instance,
   * in that order.
   */

  pickOption: function(key) {
    return this.options[key] || this.app.options[key];
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

  /**
   * Return collection items sorted by the given property.
   */

  sortBy: function (prop, fn) {
    if (typeof prop === 'function') {
      fn = prop;
      prop = undefined;
    }
    fn = fn || get;
    var keys = [];
    var obj = {};
    var sortBy = {};

    for (var key in this) {
      var val = this[key];
      var item = fn(val, prop);
      sortBy[item] = key;
      keys.push(item);
      obj[key] = val;
    }

    keys.sort();
    var len = keys.length, i = 0;
    var res = {};
    while (len--) {
      var k = sortBy[keys[i++]];
      res[k] = obj[k];
    }
    return res;
  },

  /**
   * Return filtered
   */

  value: function () {
    return this.stash || this;
  },

  /**
   * Wrapper function for exposing the collection instance
   * to loaders.
   *
   * @param {Object} `options`
   * @param {Function} `fn` Loader function
   */

  wrap: function (options, fn) {
    return fn(this, options);
  },

  /**
   * Call the given method on each value in `obj`.
   */

  visit: function (method, obj) {
    return utils.visit(this, method, obj);
  },

  /**
   * Whitelisted prototype methods.
   */

  whitelist: ['option', 'get', 'set', 'filter', 'use', 'value', 'forOwn'],

  /**
   * Mix the given collection methods onto `obj`
   */

  forward: function (obj, keys) {
    utils.forward(obj, this, keys || this.whitelist);
  }
}));

/**
 * Expose `Collection`
 */

module.exports = Collection;
