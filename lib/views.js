'use strict';

var path = require('path');
var util = require('util');
var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('extend-shallow', 'extend');
lazy('clone-deep', 'clone');
lazy('kind-of', 'typeOf');
lazy('has-values', 'has');
lazy('set-value', 'set');
lazy('get-value', 'get');
lazy('micromatch', 'mm');

/**
 * Local dependencies
 */

var Collection = require('./collection');
var utils = require('./utils');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views(options) {
  Collection.call(this, options);
  this.options.collection = this.options.collection || this;
  this.define('View', this.options.View || require('./view'));
  this.define('Item', this.View);
}

/**
 * Inherit `Collection`
 */

Collection.extend(Views);

/**
 * `Views` prototype methods
 */

utils.delegate(Views.prototype, {
  constructor: Views,

  /**
   * Set a value on the collection instance.
   *
   * @param {String} `key`
   * @param {Object} `val` The view object
   * @param {Object} Returns the instance of `Views` for chaining.
   * @api public
   */

  set: function (key, val) {
    if (lazy.typeOf(val) !== 'object') {
      lazy.set(this, key, val);
      return this;
    }
    this.addView(key, val);
    return this;
  },

  /**
   * Add a view to the current collection.
   *
   * @param {String} `key`
   * @param {Object} `val` The view object
   * @param {Object} Returns the instance of `Views` for chaining.
   * @api public
   */

  addView: function (key, val) {
    var opts = lazy.clone(this.options);
    var View = this.get('View');
    val.path = val.path || key;
    key = val.key = this.renameKey(key);
    this.setItem(key, (this[key] = new View(val, opts)));
    return this;
  },

  /**
   * Add multiple views to the collection.
   *
   * @param {Object} `views`
   * @param {Object} Returns the instance of `Views` for chaining.
   * @api public
   */

  addViews: function (views) {
    this.visit('addView', views);
    return this;
  },

  /**
   * Get a view.
   */

  get: function(prop) {
    var res = this[prop];
    if (typeof res === 'undefined') {
      var name = this.renameKey(prop);
      if (name && name !== prop) {
        res = this[name];
      }
    }
    if (typeof res === 'undefined') {
      res = lazy.get(this, prop);
    }
    if (typeof res === 'undefined') {
      res = this.find(prop);
    }
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
      var isMatch = lazy.mm.matcher(pattern, options);
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

    var matcher = pattern ? lazy.mm.isMatch(pattern, options) : null;
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
          var val = lazy.get(file, prop);
          if (prop === 'path' || prop === 'cwd') {
            val = path.relative(process.cwd(), val);
          }

          if (lazy.has(val)) {
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
 * Expose `extend`, to allow other classes to inherit
 * from the `Views` class.
 *
 * ```js
 * function MyViews(options) {...}
 * Views.extend(MyViews);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `Views`
 * @return {undefined}
 * @api public
 */

Views.extend = function (Ctor) {
  util.inherits(Ctor, Views);
  lazy.extend(Ctor, Views);
};

/**
 * Expose `Views`
 */

module.exports = Views;
