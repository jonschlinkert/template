'use strict';

var util = require('util');
var isObject = require('isobject');
var extend = require('extend-shallow');
var inflect = require('pluralize');
var flatten = require('arr-flatten');
var LoaderCache = require('loader-cache');
var set = require('set-value');
var Collection = require('./lib/collection');
var loaders = require('./lib/loaders/last');
var assert = require('./lib/error/assert');
var error = require('./lib/error/base');
var utils = require('./lib/utils');

/**
 * Create an instance of `Template` with the given `options`.
 *
 * @param {Object} `options`
 * @api public
 */
function Template(options) {
  this.options = options || {};

  this._ = {};
  this._.loaders = {};
  this.iterators = {};
  this.loaders = {};

  this.options.views = {};
  this.views = {};
  this.inflection = {};
  this.viewTypes = {};

  // error handling
  this.mixin('assert', assert.bind(this));
  this.mixin('error', error.bind(this));

  this.loaderType('sync');
  this.loaderType('async');
  this.loaderType('promise');
  this.loaderType('stream');

  this.viewType('renderable');
  this.viewType('layout');
  this.viewType('partial');
}

/**
 * Transforms are run immediately during init, and are used to
 * extend or modify the `this` object.
 *
 * @param {String} `name` The name of the transform to add.
 * @param {Function} `fn` The actual transform function.
 * @return {Object} Returns `Template` for chaining.
 * @api public
 */
Template.prototype.transform = function(name, fn) {
  if (typeof fn === 'function') {
    this.transforms[name] = fn;
  } else {
    fn = name;
  }
  this.assert('transform', 'fn', 'function', fn);
  fn.call(this, this);
  return this;
};

/**
 * Private method for registering loader types.
 *  | async
 *  | sync
 *  | stream
 *  | promise
 * @param  {String} `type`
 */
Template.prototype.loaderType = function(type) {
  this.assert('loaderType', 'type', 'string', type);
  this.loaders[type] = this.loaders[type] || {};
  this._.loaders[type] = new LoaderCache({
    cache: this.loaders[type],
  });
};

/**
 * Register a new view type.
 *
 * @param  {String} `name` The name of the view type to create.
 * @api public
 */
Template.prototype.viewType = function(name) {
  this.viewTypes[name] = [];
};

/**
 * Register a loader.
 *
 * @param  {String} `name` Loader name.
 * @param  {String} `options` Loaders default to `sync` when a `type` is not passed.
 * @param  {Array|Function} `stack` Array or list of loader functions or names.
 * @return {Object} `Template` for chaining
 * @api public
 */
Template.prototype.loader = function(name, opts, stack) {
  this.assert('loader', 'name', 'string', name);
  var args = utils.siftArgs.apply(this, [].slice.call(arguments, 1));
  this.getLoaderInstance(args.opts).register(name, args.stack);
  return this;
};

/**
 * Register an iterator for one of the registered loader types.
 *
 * @param  {String} `name` Iterator name.
 * @param  {Function} `fn` Iterator function.
 * @return {Object} `Template` for chaining
 * @api public
 */
Template.prototype.iterator = function(type, fn) {
  this.iterators[type] = fn;
  return this;
};

/**
 * Get a cached loader instance.
 *
 * @param  {String|Object} `type` Pass the type or an options object with `loaderType`.
 * @return {Object} The loader object
 * @api public
 */
Template.prototype.getLoaderInstance = function(type) {
  if (typeof type === 'undefined') {
    throw this.error('getLoaderInstance', 'expects a string or object.', type);
  }
  if (typeof type === 'string') return this._.loaders[type];
  return this._.loaders[type.loaderType || 'sync'];
};

/**
 * Build an array of loader functions from an array that contains a
 * mixture of cached loader names and functions.
 *
 * @param  {String} `type` The loader type: async, sync, promise or stream, used to get cached loaders.
 * @param  {Array} `stack`
 * @return {Array}
 * @api public
 */
Template.prototype.buildStack = function(type, stack) {
  this.assert('buildStack', 'type', 'string', type);
  if (!stack || stack.length === 0) return [];
  stack = flatten(stack);
  var len = stack.length, i = -1;
  var res = [];
  while (i < len) {
    var name = stack[++i];
    var cache = this.loaders[type];
    if (!name) continue;
    res.push(cache[name] || name);
  }
  return flatten(res);
};

/**
 * Private method for setting and mapping the plural name
 * for a view collection.
 *
 * @param  {String} `name`
 * @return {String}
 */
Template.prototype.inflect = function(name) {
  return this.inflection[name] || (this.inflection[name] = inflect(name));
};

/**
 * Private method for tracking the `subtypes` created for each
 * template collection type, to make it easier to get/set templates
 * and pass them properly to registered engines.
 *
 * @param {String} `plural` e.g. `pages`
 * @param {Object} `options`
 * @api private
 */

Template.prototype.setViewTypes = function(plural, opts) {
  var types = utils.arrayify(opts.viewType || 'renderable');
  var len = types.length, i = 0;
  while (len--) {
    var arr = this.viewTypes[types[i++]];
    if (arr.indexOf(plural) === -1) {
      arr.push(plural);
    }
  }
  return types;
};

/**
 * Create a view collection with the given `name`.
 *
 * @param  {String} `name` Singular-form collection name, such as "page" or "post". The plural inflection is automatically created.
 * @param  {Object} `options`
 * @param  {Functions|Arrays} `stack` Loader stack to use for loading templates onto the collection.
 * @return {Object} `Template` for chaining
 * @api public
 */
Template.prototype.create = function(singular, options, stack) {
  this.assert('create', 'singular', 'string', singular);
  var plural = this.inflect(singular);

  var args = [].slice.call(arguments, 1);
  var opts = isObject(options) ? args.shift(): {};
  opts.viewType = this.setViewTypes(plural, opts);
  this._set(['contexts', 'create', plural], opts);
  this.options.views[plural] = opts;

  stack = flatten(args);

  this.views[plural] = new Collection(opts, stack);
  this.decorate(singular, plural, opts, stack);
  return this;
};

/**
 * Private method for decorating a view collection with convience methods:
 *
 * @param  {String} `singular`
 * @param  {String} `plural`
 * @param  {Object} `options`
 * @param  {Arrays|Functions} `loaders`
 */
Template.prototype.decorate = function(singular, plural, options, loaders) {
  var opts = extend({}, options, {plural: plural});

  var load = function(key, value, locals, options) {
    var filter = utils.filterLoaders();
    var args = filter.apply(filter, arguments);
    args.opts = extend({}, opts, args.opts);
    var type = args.opts.loaderType || 'sync';
    var base = this.buildStack(type, loaders);
    args.stack = this.buildStack(type, base.concat(args.stack));
    var res = this.views[plural].load(args);
    if (type === 'stream' || type === 'promise') return res;
    return this.views[plural];
  };
  Template.prototype[singular] = load;
  Template.prototype[plural] = load;
};

/**
 * Private method for adding a non-enumerable property to Template.
 *
 * @param  {String} `name`
 * @param  {Function} `fn`
 * @return {Function}
 * @private
 */
Template.prototype.mixin = function(name, fn) {
  return Object.defineProperty(this, name, {
    configurable: true,
    enumerable: false,
    value: fn
  });
};

/**
 * Private method for setting a value on Template.
 *
 * @param  {Array|String} `prop` Object path.
 * @param  {Object} `val` The value to set.
 * @private
 */
Template.prototype._set = function(prop, val) {
  prop = utils.arrayify(prop).join('.');
  set(this, prop, val);
  return this;
};

/**
 * Expose `Template`
 */
module.exports = Template;
