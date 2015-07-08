'use strict';

var util = require('util');
var path = require('path');
var recent = require('recent');
var Collection = require('./collection');
var utils = require('./utils');
var View = require('./view');
var extend = require('extend-shallow');
var async = require('async');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views() {
  Collection.apply(this, arguments);
  utils.defineProp(this, 'data', {});
}

util.inherits(Views, Collection);

/**
 * Views prototype methods
 */

utils.delegate(Views.prototype, {

  /**
   * Set an item on the collection.
   */

  set: function (key, val) {
    this[this.renameKey(key)] = new View(val, this, this.app);
    return this;
  },

  /**
   * Set a view on the collection.
   */

  cwd: function (dir) {
    dir = dir || this.pickOption('cwd');
    this.options.cwd = dir;
    this.emit('cwd', dir);
    return dir;
  },

  /**
   * Load views onto the collection.
   */

  loader: function(/*options, stack*/) {
    var set = this.app.loaders.set;
    var args = [].slice.call(arguments);
    var plural = this.options.collection;
    set.apply(set, [plural].concat(args));
    return this;
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
   * Render index pages based on the number of
   * views in the collection.
   *
   * @param  {View} `index` An instance of a view to use for the index pages.
   * @param  {Object} `locals` Optional locals to use in rendering.
   * @param  {Function} `cb` Callback function that returns either an error (`err`) or a list of index pages (`indices`)
   */

  paginate: function (index, locals, options, cb) {
    if (typeof options === 'function') {
      return this.paginate(index, locals, {}, options);
    }
    if (typeof locals === 'function') {
      return this.paginate(index, {}, {}, locals);
    }
    locals = locals || {};
    options = options || {};

    var opts = extend({
      limit: 10,
      permalink: ':collection-:num.html'
    }, index.data, index.locals, locals, options);

    // var views = this.app.views[this.options.collection];
    var views = this.stash || this;

    var keys = Object.keys(views);
    var len = keys.length, i = 0, pageNum = 1;
    var total = Math.ceil(len / opts.limit);
    var pages = [];
    var page = new View(index.clone(), this, this.app);
    page.options = extend({}, page.options, opts);
    page.data = page.data || {};
    page.data.pagination = {};
    page.data.pagination.items = [];

    while (len--) {
      var item = views[keys[i++]];
      page.data.pagination.items.push(item);
      if (i % opts.limit === 0) {
        page.data.pagination.collection = this.options.collection;
        page.data.pagination.num = pageNum++;
        page.data.pagination.limit = opts.limit;
        pages.push(page);
        page = new View(index.clone(), this, this.app);
        page.options = extend({}, page.options, opts);
        page.data = page.data || {};
        page.data.pagination = {};
        page.data.pagination.items = [];
      }
    }
    if (i % opts.limit !== 0) {
      page.data.pagination.collection = this.options.collection;
      page.data.pagination.num = pageNum++;
      page.data.pagination.limit = opts.limit;
      pages.push(page);
    }

    cb(null, pages);

    // async.mapSeries(pages, function (page, next) {
    //   next(null, page);
    //   // page.render(next);
    // }.bind(this), cb);

    this.stash = views;
    this.value();
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
    var views = this;
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
          var val = utils.get(file, prop);
          if (prop === 'path' || prop === 'cwd') {
            val = path.relative(process.cwd(), val);
          }
          if (utils.hasValues(val)) {
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
  },

  /**
   * Return stash or this with prototype methods.
   */

  value: function () {
    if (this.hasOwnProperty('stash')) {
      utils.delegateAll(this.stash, Views.prototype);
      return this.stash;
    }
    return this;
  }
});

/**
 * Expose `Views`
 */

module.exports = Views;
