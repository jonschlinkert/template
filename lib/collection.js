'use strict';

var path = require('path');
var hasValues = require('has-values');
var recent = require('recent');
var extend = require('extend-shallow');
var forOwn = require('for-own');
var isMatch = require('is-match');
var omit = require('object.omit');
var loaders = require('./loaders/');
var utils = require('./utils');
var View = require('./view');

/**
 * Create a new `Collection` with the given `options`, loader `stack`
 * and instance of `template` (app).
 *
 * @param {Object} `options`
 * @param {Array} `stack`
 * @param {Object} `app`
 */

function Collection(options, stack, app) {
  this.mixin('options', options || {});

  var opts = this.options || {};
  var mixins = opts.mixins || {};
  utils.defineProperty(opts, 'app', app);

  for (var key in mixins) {
    if (mixins.hasOwnProperty(key)) {
      this.mixin(key, mixins[key].bind(this));
    }
  }

  // Create the loader method for the collection
  opts.lastLoader = this.loader(opts);
  var method = app.compose(opts, stack);

  this.delegate(app, opts.inflection, method);
  this.delegate(app, opts.collection, method);

  app[opts.inflection].__proto__ = this;
}

/**
 * Collection methods
 */

Collection.prototype = {
  constructor: Collection,

  /**
   * Create the loader to use for loading views onto
   * the collection instance.
   */

  loader: function(options) {
    var opts = omit(options, 'contexts');
    opts.app = this.options.app;
    var last = loaders.last(opts.app);

    var loader = last(this, function (key, value) {
      return this.set(key, value, opts);
    }.bind(this));
    return loader[opts.loaderType];
  },

  /**
   * Set a view on the collection.
   *
   * ```js
   * template.pages.get('a.hbs', function(fp) {
   *   return path.basename(fp);
   * });
   * ```
   *
   * @param {String} `key` Template name
   * @param {Function} `fn` Optionally pass a `renameKey` function
   * @return {Object}
   * @api public
   */

  set: function(key, value, options) {
    value.contexts = extend({}, value.contexts, options.contexts);
    value.contexts.create = options;
    value.options = extend({}, options, value.options);
    return (this[key] = new View(value, options, this));
  },

  /**
   * Get a view from the collection.
   *
   * ```js
   * template.pages.get('a.hbs', function(fp) {
   *   return path.basename(fp);
   * });
   * ```
   *
   * @param {String} `key` Template name
   * @param {Function} `fn` Optionally pass a `renameKey` function
   * @return {Object}
   * @api public
   */

  get: function(key, fn) {
    // if a custom renameKey function is passed, try using it
    if (typeof fn === 'function') {
      key = fn(key);
    }
    var res = utils.get(this, key);
    var name;

    if (utils.hasValues(res)) return res;

    // try again with the default renameKey function
    fn = this.options.renameKey;
    if (typeof fn === 'function') {
      name = fn(key);
    }
    if (name !== key) {
      return utils.get(this, name);
    }
    return null;
  },

  /**
   * Collection plugin.
   *
   * @param  {Function} `fn`
   * @return {Object} The instance of `Collection`, for chaining
   * @api public
   */

  use: function(fn) {
    fn(this);
    return this;
  },

  /**
   * Render a view on the collection.
   *
   * @param  {String|Object} `view` Name of the view to render, or a view object.
   * @param  {Object} `locals`
   * @return {String}
   * @api public
   */

  render: function () {
    var args = [].slice.call(arguments);
    var view = this.get(this, args.shift());
    return view.render.apply(this, args);
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
    var res = {};

    if (typeof options.matchBase === 'undefined') {
      options.matchBase = true;
    }

    var matcher = pattern ? isMatch(pattern, options) : null;

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
          if (hasValues(val)) {
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
    var views = this;
    if (utils.isObject(pattern)) {
      options = pattern;
      pattern = null;
    }
    if (typeof prop === 'string') {
      views = this.filter(prop, pattern, options);
    }
    return recent(views, options);
  },

  /**
   * Get related views for based on the given `prop`, `pattern` and options.
   *
   * @param  {[type]} options [description]
   * @return {[type]}
   */

  related: function(prop, patterns, options) {
    return this.filter(prop, patterns, options);
  },

  /**
   * Return any views on the collection that match the given `patterns`.
   *
   * @param  {String|Array} `patterns` Glob patterns to pass to [micromatch].
   * @param  {Object} `options` options to pass to [micromatch].
   * @return {Object}
   * @api public
   */

  matchProp: function(prop, patterns, options) {
    return utils.matchProp(this, patterns, options);
  },

  /**
   * Return any views on the collection that match the given `patterns`.
   *
   * @param  {String|Array} `patterns` Glob patterns to pass to [micromatch].
   * @param  {Object} `options` options to pass to [micromatch].
   * @return {Object}
   * @api public
   */

  matchKeys: function(patterns, options) {
    return utils.matchKeys(this, patterns, options);
  },

  /**
   * Return the values of any views on the collection that match the given `patterns`.
   *
   * @param  {String|Array} `patterns` Glob patterns to pass to [micromatch].
   * @param  {Object} `options` options to pass to [micromatch].
   * @return {Object}
   * @api public
   */

  values: function() {
    var vals = [];
    forOwn(this, function(val, key) {
      vals.push(val);
    });
    return vals;
  },

  /**
   * Delegate an early-bound method onto the `app` instance,
   * that will be invoked in the context of this collection.
   */

  delegate: function(app, key, value) {
    utils.defineProperty(app, key, value);
  },

  /**
   * Mix methods onto the `Collection` instance
   */

  mixin: function(key, value) {
    utils.defineProperty(this, key, value);
  }
};

/**
 * Expose `Collection`
 */

module.exports = Collection;
