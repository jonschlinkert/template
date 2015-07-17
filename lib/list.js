'use strict';

var async = require('async');
var clone = require('clone-deep');
var Emitter = require('component-emitter');
var filter = require('filter-values');
var groupBy = require('group-object');
var recent = require('recent');
var forOwn = require('for-own');
var forIn = require('for-in');
var set = require('set-value');
var get = require('get-value');
var sortObj = require('sort-object');
var visit = require('object-visit');
var util = require('util');
var utils = require('./utils');


function List(items, Item, options) {
  options = options || {};
  Emitter.call(this);
  this.items = items || {};
  this.app = options.app;
  utils.defineProp(this, 'Item', Item || require('./item'));
}

List.extend = function(obj) {
  util.inherits(obj, List);
};

List.prototype = Emitter({
  constructor: List,

  set: function(prop, value) {
    set(this, prop, value);
    return this;
  },

  get: function(prop) {
    return get(this, prop);
  },

  item: function(name, obj) {
    var Item = this.get('Item');
    if (typeof obj === 'undefined') {
      return this.items[name];
    }
    if (obj instanceof Item) {
      this.items[name] = obj;
    } else {
      this.items[name] = new Item(obj);
    }
    var item = this.items[name];
    this.emit('item', name, item);
    return item;
  },

  paginate: function(fn) {
    //=> todo
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
    var opts = clone(this.options);
    var items = this.items;

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
      var list = acc.item(group) || new Constructor(opts);
      list.set(key, value);
      acc.item(group, list);
    }.bind(this);

    return groupBy(items, grouper, setter, this);
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
    this.items = recent(obj, options);
    return this;
  },

  filter: function(fn) {
    this.items = filter(this.items, fn, this);
    return this;
  },

  forOwn: function (fn) {
    forOwn(this.items, fn, this);
    return this;
  },

  forIn: function (fn) {
    forIn(this, fn, this);
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

    return async.map(keys, function (key, next) {
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
