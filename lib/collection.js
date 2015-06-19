'use strict';

var omit = require('object.omit');
var get = require('get-value');
var isMatch = require('is-match');
var hasValues = require('has-values');
var recent = require('recent');
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

  opts.lastLoader = this.loader(opts);

  // Create the loader method for the collection
  var method = app.compose(opts, stack);

  this.forward(app, opts.inflection, method);
  this.forward(app, opts.collection, method);

  app[opts.inflection].__proto__ = this;
  app[opts.collection].__proto__ = this;
}

/**
 * Create the loader to use for loading views onto
 * the collection instance.
 */

Collection.prototype.loader = function(options) {
  var opts = omit(options, 'contexts');
  opts.app = this.options.app;
  var last = loaders.last(opts.app);

  var loader = last(this, function (key, value) {
    return this.set(key, value, opts);
  }.bind(this));

  return loader[opts.loaderType];
};

Collection.prototype.set = function(key, value, options) {
  return (this[key] = new View(value, options, this));
};

Collection.prototype.get = function(key) {
  return this[key];
};

Collection.prototype.recent = function(prop, pattern, options) {
  var files = this;
  if (utils.isObject(pattern)) {
    options = pattern;
    pattern = null;
  }
  if (typeof prop === 'string') {
    files = this.filter(prop, pattern, options);
  }
  return recent(files, options);
};

Collection.prototype.related = function(options) {
  return recent(this, options);
};

Collection.prototype.filter = function (prop, pattern, options) {
  options = options || {};
  var template = this;
  var matcher = pattern ? isMatch(pattern, options) : null;
  var res = {};
  for (var key in template) {
     if (template.hasOwnProperty(key)) {
      var file = template[key];
      if (prop === 'key') {
        if (matcher) {
          if (matcher(key)) {
            res[key] = file;
          }
        } else {
          res[key] = file;
        }
      } else {
        var obj = get(file, prop);
        if (hasValues(obj)) {
          if (matcher) {
            if (matcher(obj)) {
              res[key] = file;
            }
          } else {
            res[key] = file;
          }
        }
      }
    }
  }
  return this;
};

Collection.prototype.use = function(fn) {
  fn(this);
  return this;
};

/**
 * Get a view from the specified collection.
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

Collection.prototype.get = function(key, fn) {
  // if a custom renameKey function is passed, try using it
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
    return this[name];
  }
  return null;
};

/**
 * Render a view on the collection.
 *
 * @param  {String|Object} `view` Name of the view to render, or a view object.
 * @param  {Object} `locals`
 * @return {String}
 * @api public
 */

Collection.prototype.render = function () {
  var args = [].slice.call(arguments);
  var view = this.get.call(this, args.shift());
  return view.render.apply(this, args);
};

/**
 * Return any views on the collection that match the given `patterns`.
 *
 * @param  {String|Array} `patterns` Glob patterns to pass to [micromatch].
 * @param  {Object} `options` options to pass to [micromatch].
 * @return {Object}
 * @api public
 */

Collection.prototype.match = function(patterns, options) {
  return utils.matchKeys(this, patterns, options);
};

/**
 * Mix methods onto the `app` instance
 */

Collection.prototype.forward = function(app, key, value) {
  utils.defineProperty(app, key, value);
};

/**
 * Mix methods onto the `Collection` instance
 */

Collection.prototype.mixin = function(key, value) {
  utils.defineProperty(this, key, value);
};

/**
 * Expose `Collection`
 */

module.exports = Collection;
