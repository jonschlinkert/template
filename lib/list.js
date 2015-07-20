'use strict';

var lazy = require('lazy-cache')(require);
var filter = lazy('filter-values');
var extend = lazy('extend-shallow');
var groupBy = lazy('group-array');
var sortObj = lazy('sort-object');
var sortArr = lazy('array-sort');
var clone = lazy('clone-deep');
var get = lazy('get-value');
var recent = lazy('recent');
var async = lazy('async');
var util = lazy('util');

var utils = require('./utils');
var Base = require('./base');

/**
 * List constructor inherits from Base
 * Create a list of items that can be sorted, filtered, grouped, and paginated.
 *
 * ```js
 * var list = new List();
 * ```
 *
 * @param {Object} `options` Options passed to Base
 * @return {Object} new instance of List
 * @api public
 */

function List(options) {
  Base.call(this, options || {});
  utils.defineProp(this, 'items', []);
  utils.defineProp(this, 'keyMap', {});
  utils.defineProp(this, 'Item', this.options.Item || require('./item'));
  this.visit('item', this.options.items || {});
  delete this.options.items;
}

Base.extend(List);

/**
 * Inherit from the List class
 *
 * ```js
 * function Groups (options) {...}
 * List.extend(Groups);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend List onto.
 * @return {undefined}
 * @api public
 */

List.extend = function(Ctor) {
  util().inherits(Ctor, List);
};

utils.delegate(List.prototype, {
  constructor: List,

  /**
   * Get or Add an item to the list. Creates a new instance of `Item` when
   * adding.
   *
   * ```js
   * var list = new List();
   * list.item('foo', {name: 'foo'});
   * console.log(list.items);
   * //=> [{name: 'foo'}]
   * ```
   *
   * @param  {String} `name` Name of the item to get or add.
   * @param  {Object} `obj` Optional item to add or update.
   * @return {Object} `item`
   * @api public
   */

  item: function(name, obj) {
    var Item = this.get('Item');
    if (typeof obj === 'undefined') {
      return this.items[this.keyMap[name]];
    }

    var item = null;
    if (obj instanceof Item) {
      item = obj;
    } else {
      item = new Item();
      item.visit('set', obj);
    }

    item.key = item.key || name;
    var i = this.keyMap[name];
    if (i >= 0) {
      this.items[i] = item;
    } else {
      this.items.push(item);
      this.keyMap[name] = this.items.length - 1;
    }

    this.emit('item', name, item);
    return item;
  },

  /**
   * Generate list pages based on the number of views in the collection.
   * This method should be called pre-render.
   *
   * @param  {View} `view` The list view use for the pages.
   * @param  {Object} `options` Additional options to use.
   * @return {Object} new List object containing the new pages as items.
   * @api public
   */

  paginate: function (view, options) {
    // paginate will return a new List of this same type
    var Constructor = this.constructor;
    // New "pages" in the list will use the `view` constructor
    var View = view.constructor;
    // make sure the items being paginated are the same as this List's items.
    var Item = this.get('Item');

    var opts = options || {};
    var keys = Object.keys(this.keyMap);
    var items = this.items.map(function (item, i) {
      item.key = keys[i];
      return item;
    });

    var len = items.length, i = 0, pageNum = 1;
    var totalPages = Math.ceil(len / opts.limit);

    // helper function to create a new page to put into the returned list.
    function createPage() {
      var page = new View(view.clone(), extend()({}, view.options, opts));
      page.data.pagination = new Constructor(extend()({}, this.options, {Item: Item}));
      return page;
    }

    function updateProperties(page) {
      page.data.pagination.collection = this.options.collection;
      page.data.pagination.first = 1;
      page.data.pagination.prev = pageNum === 1 ? 1 : pageNum;
      page.data.pagination.num = pageNum++;
      page.data.pagination.next = pageNum >= totalPages ? totalPages : pageNum;
      page.data.pagination.last = totalPages;
      page.data.pagination.index = page.data.pagination.num;
      page.data.pagination.limit = opts.limit;
      page.data.pagination.total = totalPages;
    }

    // pages is the new list being created
    var pages = new Constructor(extend()({}, this.options, opts, {Item: View}));
    var page = createPage.call(this);

    while (len--) {
      var item = items[i++];
      // each item being paginated will go into the pagination list
      // for the current page
      page.data.pagination.item(item.key, item);
      if (i % opts.limit === 0) {
        updateProperties.call(this, page);
        pages.item('page-' + (pageNum-1), page);
        page = createPage.call(this);
      }
    }

    if (i % opts.limit !== 0) {
      updateProperties.call(this, page);
      pages.item('page-' + (pageNum-1), page);
    }

    return pages;
  },

  /**
   * Sort list items.
   *
   * @param  {String} `prop` Property to sort by, undefined to sort by keys.
   * @param  {Function} `fn` Optional getter function to get items by.
   * @return {Object} Returns current instance to enable chaining
   * @api public
   */

  sortBy: function (prop, fn) {
    if (typeof prop === 'function') {
      fn = prop;
      prop = undefined;
    }

    if (typeof prop === 'undefined') {
      return this.sortByKeys(fn);
    }
    return this.sortByItems(prop, fn);
  },

  /**
   * Sort list items by their keys.
   *
   * @param  {Function} `fn` Optional getter function to get items by.
   * @return {Object} Returns current instance to enable chaining
   * @api public
   */

  sortByKeys: function (fn) {
    var items = this.items;
    var sorted = sortObj()(this.keyMap, {prop: undefined, get: fn});
    var keys = Object.keys(sorted);
    var len = keys.length, i = 0;
    var arr = new Array(len);
    while (len--) {
      var key = keys[i];
      arr[i] = items[sorted[key]];
      sorted[key] = i;
      i++;
    }

    this.items = arr;
    this.keyMap = sorted;
    return this;
  },

  /**
   * Sort list items by a property on each item.
   *
   * @param  {String} `prop` Property to sort by.
   * @param  {Function} `fn` Optional getter function to get items by.
   * @return {Object} Returns current instance to enable chaining
   * @api public
   */

  sortByItems: function (prop, fn) {
    var keys = Object.keys(this.keyMap);
    var items = this.items.map(function (item, i) {
      item.key = keys[i];
      return item;
    });
    var sorted = sortArr()(items, prop);
    this.items = sorted;
    this.keyMap = this.items.reduce(function (acc, item, i) {
      acc[item.key] = i;
      return acc;
    }, {});
    return this;
  },

  /**
   * Group list by specified prop string.
   * Returns list of lists of items.
   *
   * ```js
   * app.posts.groupBy('data.date', function (date) { return new Date(date).getYear(); });
   * //=> {'2015': [{name: 'page-1'}]}
   * ```
   *
   * @param  {String} `prop` Property string to group by
   * @param {Function} `fn` Grouping function to use.
   * @return {Object} new List object with individual groups as items.
   * @api public
   */

  groupBy: function (prop, fn) {
    if (typeof prop === 'function') {
      fn = prop;
      prop = null;
    }
    if (typeof fn !== 'function') {
      fn = function (value) {
        return value;
      };
    }

    var Constructor = this.constructor;
    var opts = clone()(this.options);
    var keys = Object.keys(this.keyMap);
    var items = this.items.map(function (item, i) {
      item.key = keys[i];
      return item;
    });

    // create a new list of lists
    var groupsList = new Constructor(extend()({}, opts, {Item: Constructor}));

    var grouper = function (acc, value, idx, arr, setter) {
      var groups = fn(get()(value, prop) || value);
      groups = utils.arrayify(groups);
      var len = groups.length, i = 0;
      while (len--) {
        var group = groups[i++];
        setter(acc, group, value, idx, arr);
      }
    };

    var setter = function (acc, group, value, idx, arr) {
      if (typeof group === 'undefined') return;
      var list = acc.item(group) || new Constructor(opts);
      list.item(value.key, value);
      acc.item(group, list);
    }.bind(this);

    return groupBy()(items, grouper, setter, groupsList);
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
    var items = this.items;
    for (var key in items) {
      var val = items[key];
      if (val && typeof val !== 'function' && val.path) {
        obj[key] = val;
      }
    }
    this.items = recent()(obj, options);
    return this;
  },


  filter: function(fn) {
    this.items = filter()(this.items, fn, this);
    return this;
  },

  /**
   * Iterator over each of the items in the list.
   *
   * ```js
   * list.forEach(function (item) {
   *   console.log(item);
   * });
   * ```
   *
   * @param  {Function} `fn` Function called and passed each item.
   * @return {Object} Returns current instance for chaining
   * @api public
   */

  forEach: function (fn) {
    this.items.forEach(fn.bind(this));
    return this;
  },

  /**
   * Render all items in the list.
   *
   * @param  {Object} `locals`
   * @param  {Function} `fn`
   * @return {Object}
   * @api public
   */

  render: function (locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var app = this.app;

    return async().map(this.items, function (item, next) {
      process.nextTick(function () {
        app.render(item, locals, function render(err, res) {
          if (err) return next(err);
          next(null, res);
        });
      });
    }, cb);
  },
});

/**
 * Expose `List`
 */

module.exports = List;
