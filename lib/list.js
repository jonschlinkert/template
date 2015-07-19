'use strict';

var lazy = require('lazy-cache')(require);
var filter = lazy('filter-values');
var extend = lazy('extend-shallow');
var groupBy = lazy('group-array');
var sortObj = lazy('sort-object');
var sortArr = lazy('array-sort');
var clone = lazy('clone-deep');
var forOwn = lazy('for-own');
var set = lazy('set-value');
var get = lazy('get-value');
var recent = lazy('recent');
var forIn = lazy('for-in');
var async = lazy('async');
var util = lazy('util');

var utils = require('./utils');
var Base = require('./base');

function List(options) {
  Base.call(this, options || {});
  utils.defineProp(this, 'items', []);
  utils.defineProp(this, 'keys', {});
  utils.defineProp(this, 'Item', this.options.Item || require('./item'));
  this.visit('item', this.options.items || {});
}

Base.extend(List);

List.extend = function(obj) {
  util().inherits(obj, List);
};

utils.delegate(List.prototype, {
  constructor: List,

  set: function(prop, value) {
    set()(this, prop, value);
    return this;
  },

  get: function(prop) {
    return get()(this, prop);
  },

  item: function(name, obj) {
    var Item = this.get('Item');
    if (typeof obj === 'undefined') {
      return this.items[this.keys[name]];
    }
    var item = null;
    if (obj instanceof Item) {
      item = obj;
    } else {
      item = new Item(obj);
    }

    var i = this.keys[name];
    if (i >= 0) {
      this.items[i] = item;
    } else {
      this.items.push(item);
      this.keys[name] = this.items.length - 1;
    }

    this.emit('item', name, item);
    return item;
  },

  paginate: function(fn) {
    //=> todo
  },

  /**
   * Sort list items.
   */

  sortBy: function (prop, fn) {
    if (typeof prop === 'function') {
      fn = prop;
      prop = undefined;
    }

    var res;
    if (typeof prop === 'undefined') {
      return this.sortByKeys(fn);
    }
    return this.sortByItems(prop, fn);
  },

  /**
   * Sort list items by their keys
   */

  sortByKeys: function (fn) {
    var items = this.items;
    var sorted = sortObj()(this.keys, {prop: undefined, get: fn});
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
    this.keys = sorted;
    return this;
  },

  /**
   * Sort list items by a property on the item.
   */

  sortByItems: function (prop, fn) {
    var keys = Object.keys(this.keys);
    var items = this.items.map(function (item, i) {
      item.key = keys[i];
      return item;
    });
    var sorted = sortArr()(items, prop);
    this.items = sorted;
    this.keys = this.items.reduce(function (acc, item, i) {
      acc[item.key] = i;
      return acc;
    }, {});
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
    var keys = Object.keys(this.keys);
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

  forEach: function (fn) {
    this.items.forEach(fn.bind(this));
    return this;
  },

  forOwn: function (fn) {
    forOwn()(this, fn, this);
    return this;
  },

  forIn: function (fn) {
    forIn()(this, fn, this);
    return this;
  },

  /**
   * Render all views in the list.
   *
   * @param  {Object} `locals`
   * @param  {Function} `fn`
   * @return {Object}
   */

  render: function (locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var items = this.items;
    var keys = Object.keys(items);
    var app = this.app;
    var views = {};

    return async().map(keys, function (key, next) {
      var view = items[key];

      app.render(view, locals, function (err, res) {
        if (err) return next(err);
        return next(null, res);
      });
    }, cb);
  },
});

/**
 * Expose `List`
 */

module.exports = List;
