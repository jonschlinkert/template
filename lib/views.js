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
   * Generate list pages based on the number of views in the collection.
   * This method should be called pre-render.
   *
   * @param  {View} `view` The view use for the view pages.
   * @param  {Object} `locals` Optional locals to use in rendering.
   * @param  {Object} `options` Additional options to use.
   * @param  {Function} `cb` Callback function that returns either an error (`err`) or a collection of view pages (`views`)
   */

  paginate: function (list, locals, options, cb) {
    if (typeof options === 'function') {
      return this.paginate(list, locals, {}, options);
    }
    if (typeof locals === 'function') {
      return this.paginate(list, {}, {}, locals);
    }

    // temporary
    if (typeof list === 'function') {
      cb = list;
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
      list = this.app.list.get('list.hbs');
      return this.paginate(list, {}, {}, cb);
    }

    locals = locals || {};
    options = options || {};

    var opts = this.pickOption('pagination') || {};
    var paginateOpts = {limit: 10, permalinks: {structure: ':collection-:num.html'}};
    extend(opts, paginateOpts);
    extend(opts, list.data, list.locals);
    extend(opts, locals);
    extend(opts, options);

    var items = this.items();
    var keys = Object.keys(items);

    var len = keys.length, i = 0, pageNum = 1;
    var total = Math.ceil(len / opts.limit);
    var pages = [];

    var page = new View(list.clone(), this, this.app);
    page.options = extend({}, page.options, opts);
    page.data = page.data || {};
    page.data.pagination = {};
    page.data.pagination.items = [];

    while (len--) {
      var item = items[keys[i++]];
      page.data.pagination.items.push(item);
      if (i % opts.limit === 0) {
        page.data.pagination.collection = this.options.collection;
        page.data.pagination.num = pageNum++;
        page.data.pagination.index = page.data.pagination.num;
        page.data.pagination.limit = opts.limit;
        pages.push(page);

        page = new View(list.clone(), this, this.app);
        page.options = extend({}, page.options, opts);
        page.data = page.data || {};
        page.data.pagination = {};
        page.data.pagination.items = [];
      }
    }

    if (i % opts.limit !== 0) {
      page.data.pagination.collection = this.options.collection;
      page.data.pagination.num = pageNum++;
      page.data.pagination.index = page.data.pagination.num;
      page.data.pagination.limit = opts.limit;
      pages.push(page);
    }

    cb(null, pages);

    this.stash = items;
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
