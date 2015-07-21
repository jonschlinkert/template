'use strict';

var util = require('util');
var set = require('set-value');
var forIn = require('for-in');
var clone = require('clone-deep');
var sortObj = require('sort-object');
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
  utils.defineProp(this, '_items', {});
  utils.defineProp(this, 'Item', this.options.Item || require('./item'));
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
      return this._items;
    },
    set: function (items) {
      forIn(items, function (item, key) {
        delete this._items[key];
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
   * Set an item
   */

  setItem: function (prop, val) {
    this._items[prop] = val;
    return this;
  },

  /**
   * Set a value.
   */

  set: function (prop, val) {
    this.setItem(prop, val);
    set(this, prop, val);
    return this;
  },

  /**
   * Get or create a new list.
   */

  list: function (name, items) {
    var List = this.get('List');
    var list = this.lists[name];
    if (typeof list === 'undefined') {
      var opts = clone(this.options);
      opts.items = items || this.items;
      opts.collection = this;
      this.lists[name] = list = new List(opts);
    }
    return list;
  },

  /**
   * Generate list pages based on the number of views in the collection.
   * This method should be called pre-render.
   *
   * @param  {View} `view` The view use for the view pages.
   * @param  {Object} `locals` Optional locals to use in rendering.
   * @param  {Object} `options` Additional options to use.
   * @param  {Function} `cb` Callback function that returns either an error (`err`) or a collection of view pages (`views`)
   */

  paginate: function (view, options) {
    var Item = this.get('Item');
    if (!(view instanceof Item)) {
      options = options || view || {};
      this.app.create('list');
      this.app.list('list.hbs', {
        content: 'BEFORE\n{{#each pagination.items}}{{locals.title}}\n{{/each}}\nAFTER',
        locals: {
          limit: 2,
          permalinks: {
            structure: ':collection/:num.html'
          }
        }
      });
      view = this.app.list.get('list.hbs');
    }

    var list = this.list('paginate');
    var res = list.paginate(view, options);
    return res;
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
  }
});

/**
 * Expose `Collection`
 */

module.exports = Collection;
