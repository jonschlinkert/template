'use strict';

var path = require('path');
var util = require('util');
var Collection = require('./collection');
var utils = require('./utils');

/**
 * Lazily required dependencies
 */

var lazy = require('lazy-cache')(require);
var hasValues = lazy('has-values');
var get = lazy('get-value');
var mm = lazy('micromatch');
var clone = lazy('clone-deep');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views(options) {
  Collection.call(this, options);
  this.options.collection = this.options.collection || this;
  utils.defineProp(this, 'View', this.options.View || require('./view'));
  utils.defineProp(this, 'Item', this.View);
}

/**
 * Inherit `Collection`
 */

Collection.extend(Views);

/**
 * Expose `extend`, to allow other classes to inherit
 * from the `Views` class.
 *
 * ```js
 * function MyCustomViews(options) {...}
 * Views.extend(MyCustomViews);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `Views`
 * @return {undefined}
 * @api public
 */

Views.extend = function (obj) {
  util.inherits(obj, Views);
};

/**
 * `Views` prototype methods
 */

utils.delegate(Views.prototype, {
  constructor: Views,

  /**
   * Set an item on the collection.
   */

  set: function (key, val) {
    var View = this.get('View');
    key = this.renameKey(key);
    val.key = val.key || key;
    var opts = clone()(this.options);
    this[key] = new View(val, opts);
    this.setItem(key, this[key]);
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

    res = get()(this, prop);
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
    var self = this;
    function find() {
      var isMatch = mm().matcher(pattern, options);
      for (var key in self) {
        var val = self[key];
        if (typeof val === 'object' && isMatch(key)) {
          return val;
        }
      }
    }
    var res = this.fragmentCache(pattern, find);
    res.__proto__ = this;
    return res;
  },

  /**
   * Compile a view in the collection.
   *
   * @param  {String|Object} `view` View key or object.
   * @param  {Object} `locals`
   * @param  {Function} `fn`
   * @return {Function}
   */

  compile: function (view/*, locals*/) {
    var args = [].slice.call(arguments, 1);
    var app = this.app;
    if (typeof view === 'string') view = this[view];
    app.compile.apply(app, [view].concat(args));
    return this;
  },

  /**
   * Render a view in the collection.
   *
   * @param  {String|Object} `view` View key or object.
   * @param  {Object} `locals`
   * @param  {Function} `fn`
   * @return {Object}
   */

  render: function (view/*, locals, fn*/) {
    var args = [].slice.call(arguments, 1);
    var app = this.app;
    if (typeof view === 'string') view = this[view];
    app.render.apply(app, [view].concat(args));
    return this;
  },

  /**
   * Filter views by the given `prop`, using the specified `pattern` and `options.
   *
   * @param  {String} `prop` The property to sort by.
   * @param  {String|Object|Array|Function} `pattern` Function, glob patterns, object, array, or string pattern to use for pre-filtering views.
   * @param  {Object} `options`
   * @option  {Object} `limit` [options]
   * @option  {Object} `limit` [options]
   * @return {Object}
   */

  filter: function (prop, pattern, options) {
    options = options || {};
    var views = this.items;
    var res = Object.create(this);

    var matcher = pattern ? utils.isMatch(pattern, options) : null;

    for (var key in views) {
       if (views.hasOwnProperty(key)) {
        var file = views[key];
        if (prop === 'key') {
          if (matcher) {
            if (matcher(path.relative(process.cwd(), key))) {
              res[key] = file;
            }
          } else {
            res[key] = file;
          }
        } else {
          var val = get()(file, prop);
          if (prop === 'path' || prop === 'cwd') {
            val = path.relative(process.cwd(), val);
          }

          if (hasValues()(val)) {
            if (matcher) {
              if (matcher(val)) {
                res[key] = file;
              }
            } else {
              res[key] = file;
            }
          }
        }
      }
    }
    return res;
  },

  /**
   * Set view types for the collection.
   *
   * @param {String} `plural` e.g. `pages`
   * @param {Object} `options`
   * @api private
   */

  viewType: function() {
    this.options.viewType = utils.arrayify(this.options.viewType || []);
    if (this.options.viewType.length === 0) {
      this.options.viewType.push('renderable');
    }
    return this.options.viewType;
  }
});

/**
 * Expose `Views`
 */

module.exports = Views;
