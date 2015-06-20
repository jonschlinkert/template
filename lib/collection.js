'use strict';

var path = require('path');
var lazy = require('lazy-cache');
var recent = lazy('recent');
var extend = require('extend-shallow');
var loaders = require('./loaders/');
var utils = require('./utils/');
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
  utils.mixin(this, 'options', options || {});
  var opts = this.options || {};
  var mixins = opts.mixins || {};

  for (var key in mixins) {
    if (mixins.hasOwnProperty(key)) {
      utils.mixin(this, key, mixins[key].bind(this));
    }
  }

  utils.mixin(opts, 'app', app);
  utils.mixin(this, 'data', {});

  // Create the loader method for the collection
  opts.lastLoader = this.loader(opts);

  var fn = app.compose(opts, stack);
  fn.__proto__ = this;

  utils.mixin(app, opts.inflection, fn);
  utils.mixin(app, opts.collection, fn);
  return this;
}

/**
 * Collection methods
 */

Collection.prototype = {
  constructor: Collection,

  /**
   * Create a loader for adding views to the collection instance.
   */

  loader: function(options) {
    var opts = utils.omit(options, 'contexts');
    var type = opts.loaderType;

    var set = utils.partialRight(this, this.set, opts);
    return loaders.last(this, set)[type];
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

  set: function(key, val, opts) {
    var app = this.options.app;

    val.contexts = utils.extend({ create: opts }, val.contexts);
    val.options = utils.extend({}, opts, val.options);

    var view = new View(val, opts, this);
    app.handle('onLoad', view);

    return (this[key] = view);
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
    // use renameKey function, if passed
    if (typeof fn === 'function') {
      key = fn(key);
    }
    if (key in this) {
      return this[key];
    }
    // try again with the default renameKey function
    fn = this.options.renameKey;
    var name;
    if (typeof fn === 'function') {
      name = fn(key);
    }
    if (name && name !== key && name in this) {
      var res = this[name];
      if (res) return res;
    }
    return utils.get(this, key);
  },

  /**
   * Clone the collection instance.
   *
   * @return {Object}
   * @api public
   */

  clone: function() {
    return utils.cloneDeep(this);
  },

  /**
   * Run a collection plugin.
   *
   * @param  {Function} `fn`
   * @return {Object} The instance of `Collection`, for chaining
   * @api public
   */

  use: function(fn) {
    fn.call(this, this);
    return this;
  },

  /**
   * Build the "global" context for a collection.
   *
   * @param  {Function|Object} `data` Optionally pass a function
   * to customize or object to extend the context.
   * @api public
   */

  context: function(data) {
    // todo: this is pseudo-code
    var ctx = {};
    if (typeof data === 'function') {
      ctx = data.call(this, this.data, this.locals);
      if (!ctx || typeof ctx !== 'object') {
        throw new Error('Collection#context custom functions must return an object.');
      }
      return ctx;
    }
    extend(ctx, this.data);
    extend(ctx, this.locals);
    extend(ctx, data || {});
    return ctx;
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
    var app = this.options.app;
    var args = [].slice.call(arguments);
    var view = this.get(args.shift());
    return view.render.apply(view, args);
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
    var val = utils.get(this, prop);

    return utils.matchKeys(this, patterns, options);
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
   * Return any views on the collection that match the given `patterns`.
   *
   * @param  {String|Array} `patterns` Glob patterns to pass to [micromatch].
   * @param  {Object} `options` options to pass to [micromatch].
   * @return {Object}
   * @api public
   */

  match: function(patterns, options) {
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

  values: function(patterns, options) {
    var views = this.matchKeys(patterns, options);
    var vals = [];

    utils.forOwn(views, function(val, key) {
      vals.push(val);
    });
    return vals;
  }
};


/**
 * Expose `Collection`
 */

module.exports = Collection;
