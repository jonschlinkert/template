'use strict';

var util = require('util');
var Base = require('./base');
var utils = require('./utils');
var get = require('get-value');
var forIn = require('for-in');
var sortObj = require('sort-object');
var groupBy = require('group-object');
var recent = require('recent');

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

util.inherits(Collection, Base);

/**
 * Collection methods
 */

utils.delegate(Collection.prototype, {

  /**
   * Set or get data on the collection.
   */

  data: function (prop, value) {
    utils.data(this, prop, value);
    return this;
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
   * Get an option from the collection or app instance,
   * in that order.
   */

  pickOption: function(key) {
    return this.options[key]
      || this.app.options[key];
  },

  /**
   * Return collection items sorted by the given property.
   */

  sortBy: function (prop, fn) {
    if (typeof prop === 'function') {
      fn = prop;
      prop = undefined;
    }

    var items = this.items();
    this.stash = sortObj(items, { prop: prop, get: fn });
    this.value();
    return this;
  },

  /**
   * Group list by specified prop string.
   * Returns collection of collections of items.
   *
   * ```js
   * app.posts.groupBy('data.date', function (date) { return new Date(date).getYear(); });
   * //=> {'2015': {'page-1': {...}}}
   * ```
   *
   * @param  {String} `prop` Property string to group by
   * @param {Function} `fn` Grouping function to use.
   * @param {Function} `cb` Callback function that will get an `err` and `groups` object
   * @return {Object} `this` to enable chaining
   * @api public
   */

  groupBy: function (prop, fn, cb) {
    if (typeof prop === 'function') {
      return this.groupBy(null, prop, cb);
    }
    if (typeof cb !== 'function' && typeof fn === 'function') {
      return this.groupBy(prop, null, fn);
    }
    if (typeof fn !== 'function') {
      return this.groupBy(prop, function (value) {
        return value;
      }, cb);
    }
    var Constructor = this.constructor;
    var items = this.items();

    var grouper = function (acc, value, key, obj, setter) {
      var groups = fn(get(value, prop) || key);
      groups = utils.arrayify(groups);
      var len = groups.length, i = 0;
      while (len--) {
        var group = groups[i++];
        setter(acc, group, value, key, obj);
      }
    };

    var setter = function (acc, group, value, key, obj) {
      if (typeof group === 'undefined') return;
      acc[group] = acc[group] || new Constructor(this.app, null, this.options);
      acc[group].set(key, value);
    }.bind(this);

    cb(null, groupBy(items, grouper, setter));

    return this;
  },

  /**
   * Return the most recent items from a collection. By default, one of
   * the following properties will be used for sorting, and in the order
   * specified: `key`, `path`, or `data.date`.
   *
   * @param  {String} `prop` The property to sort by.
   * @param  {String|Object|Array|Function} `pattern` Function, glob patterns, object, array, or string pattern to use for pre-filtering files.
   * @param  {Object} `options` Options to pass to [micromatch] if glob patterns are used.
   * @return {Object}
   */

  recent: function(prop, pattern, options) {
    var obj = {};
    for (var key in this) {
      obj[key] = this[key];
    }
    var res = recent(obj, options);
    res.__proto__ = this;
    return res;
  },

  /**
   * Get an object reprensenting the current items (from stash or this);
   *
   * ```js
   * var items = this.items();
   * ```
   *
   * @return {Object} Object of items
   */

  items: function () {
    var obj = this.stash || this;
    return obj.forIn(function (item) {
      return utils.isObject(item) && typeof item !== 'function';
    }).value();
  },

});

/**
 * Expose `Collection`
 */

module.exports = Collection;
