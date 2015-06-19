'use strict';

var util = require('util');
var omit = require('object.omit');
var recent = require('recent');
var Options = require('option-cache');
var extend = require('extend-shallow');
var cloneDeep = require('clone-deep');
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
  this.mixin('options', cloneDeep(options || {}));

  var opts = this.options || {};
  var mixins = opts.mixins || {};
  opts.app = app;

  for (var key in mixins) {
    if (mixins.hasOwnProperty(key)) {
      this.mixin(key, mixins[key].bind(this));
    }
  }

  opts.lastLoader = this.load(opts);

  // Create the loader method for the collection
  var method = app.compose(opts, stack);

  utils.defineProperty(app, opts.inflection, method);
  utils.defineProperty(app, opts.collection, method);

  app[opts.inflection].__proto__ = this;
  app[opts.collection].__proto__ = this;
}

/**
 * Extend locals for a view.
 */

Collection.prototype.load = function(options) {
  var opts = cloneDeep(omit(options, 'contexts'));
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

Collection.prototype.recent = function(options) {
  return recent(this, options);
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
 * Mix methods onto the `Collection` instance
 */

Collection.prototype.mixin = function(key, value) {
  utils.defineProperty(this, key, value);
};

/**
 * Expose `Collection`
 */

module.exports = Collection;
