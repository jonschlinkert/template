'use strict';

var util = require('util');
var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('extend-shallow', 'extend');
lazy('for-in', 'forIn');
lazy('clone-deep', 'clone');
lazy('set-value', 'set');
lazy('sort-object', 'sortObj');

/**
 * Local modules
 */

var Base = require('./base');
var utils = require('./utils');
var mixins = require('./mixins/collection');

/**
 * Create an instance of `Collection` with the specified `options`.
 * The `Collection` constructor inherits from Base.
 *
 * ```js
 * var collection = new Collection();
 * ```
 * @param {Object} `options`
 * @return {undefined}
 * @api public
 */

function Collection(options) {
  Base.call(this, options);
  this.define('lists', {});
  this.define('_items', {});
  this.define('Item', this.options.Item || require('./item'));
  this.define('List', this.options.List || require('./list'));
  mixins(this);

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
      lazy.forIn(items, function (item, key) {
        delete this._items[key];
        delete this[key];
        this.set(key, item);
      }, this);
    }
  });
}

/**
 * Inherit `Base`
 */

Base.extend(Collection);

/**
 * `Collection` prototype methods
 */

utils.delegate(Collection.prototype, {
  constructor: Collection,

  /**
   * Set a value.
   */

  set: function (prop, val) {
    this.setItem(prop, val);
    if (prop === 'app' || prop === 'collection') {
      this.define(prop, val);
    } else {
      lazy.set(this, prop, val);
    }
    return this;
  },

  /**
   * Set an item
   */

  setItem: function (prop, val) {
    if (prop === 'app' || prop === 'collection') {
      utils.defineProp(this._items, prop, val);
    } else {
      this._items[prop] = val;
    }
    return this;
  },

  /**
   * Get an item
   */

  getItem: function (prop) {
    return this._items[prop];
  },

  /**
   * Get or create a new list.
   */

  list: function (name, items) {
    var List = this.get('List');
    var list = this.lists[name];
    if (typeof list === 'undefined') {
      var opts = lazy.clone(this.options);
      opts.items = items || this.items;
      opts.collection = this;
      this.lists[name] = list = new List(opts);
    }
    return list;
  },

  createList: function () {
    return this.list.apply(this, arguments);
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
    this.items = lazy.sortObj(items, {
      prop: prop,
      get: fn
    });
    return this;
  }
});

/**
 *
 * Expose `extend`, static method for allowing other classes to inherit
 * from the `Collection` class (and receive all of Collection's prototype methods).
 *
 * ```js
 * function MyCustomCollection(options) {...}
 * Collection.extend(MyCustomCollection);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `Collection`
 * @return {undefined}
 * @api public
 */

Collection.extend = function(Ctor) {
  util.inherits(Ctor, Collection);
  lazy.extend(Ctor, Collection);
};

/**
 * Expose `Collection`
 */

module.exports = Collection;
