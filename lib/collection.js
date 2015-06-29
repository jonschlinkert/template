'use strict';

var util = require('util');
var forIn = require('for-in');
var forOwn = require('for-own');
var Emitter = require('component-emitter');
var extend = require('extend-shallow')
var get = require('get-value');
var set = require('set-value');
var Base = require('./base');
var utils = require('./utils');

/**
 * Create an instance of `Collection`.
 *
 * @api public
 */

function Collection(app, loaders, options) {
  Base.apply(this, arguments);
  utils.defineProp(this, 'options', options);
  utils.defineProp(this, '_callbacks', this._callbacks);
  utils.defineProp(this, 'app', app);
}

utils.inherits(Collection, Base);

/**
 * Collection methods
 */

utils.delegate(Collection.prototype, {

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
   * Whitelisted prototype methods.
   */

  whitelist: ['option', 'get', 'set', 'filter', 'use', 'value', 'forOwn'],

  /**
   * Mix the given collection methods onto `obj`
   */

  forward: function (obj, keys) {
    utils.forward(obj, this, keys || this.whitelist);
  }
});

/**
 * Expose `Collection`
 */

module.exports = Collection;
