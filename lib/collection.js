'use strict';

var util = require('util');
var clone = require('clone-deep');
var set = require('set-value');
var get = require('get-value');
var forIn = require('for-in');
var forOwn = require('for-own');
var sortObj = require('sort-object');
var groupBy = require('group-object');
var recent = require('recent');
var Base = require('./base');
var utils = require('./utils');

/**
 * Create an instance of `Collection`.
 *
 * @api public
 */

function Collection(options) {
  Base.call(this, options);
  utils.defineProp(this, 'lists', {});
  utils.defineProp(this, 'List', this.options.List || require('./list'));


  /**
   * Get an object representing the current items on the instance.
   *
   * ```js
   * var items = this.items;
   * ```
   *
   * @return {Object} Object of items
   */


  Object.defineProperty(this, 'items', {
    enumerable: false,
    configurable: true,
    get: function () {
      var items = {};
      this.forOwn(function (item, key) {
        items[key] = item;
      });
      return items;
    },
    set: function (items) {
      forOwn(items, function (item, key) {
        delete this[key];
        this.set(key, item);
      }, this);
    }
  });
}

Base.extend(Collection);

/**
 * Static method for extending `Collection` onto the
 * given `object`.
 */

Collection.extend = function(obj) {
  util.inherits(obj, Collection);
};

/**
 * Collection methods
 */

utils.delegate(Collection.prototype, {
  constructor: Collection,

  /**
   * Get or create a new list.
   */

  list: function (name, items) {
    var List = this.get('List');
    var list = this.lists[name];
    if (typeof list === 'undefined') {
      var opts = clone(this.options);
      opts.items = items || this.clone();
      opts.collection = this;
      this.lists[name] = list = new List(opts);
    }
    return list;
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
   * Return collection items sorted by the given property.
   */

  sortBy: function (prop, fn) {
    if (typeof prop === 'function') {
      fn = prop;
      prop = undefined;
    }

    var items = this.items;
    this.items = sortObj(items, {
      prop: prop,
      get: fn
    });
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
    var List = this.get('List');
    var opts = clone(this.options);
    var res = new List(opts);

    options = options || {};
    options.prop = options.prop || prop;

    var obj = {};
    var views = this.items;
    for (var key in views) {
      obj[key] = this[key];
      obj[key].key = key;
    }
    var rec = recent(obj, options);
    res.visit('item', rec);
    return res;
  },

});

/**
 * Expose `Collection`
 */

module.exports = Collection;
