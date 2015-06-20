'use strict';


// require('time-require');

/**
 * Module dependencies
 */

var Config = require('config-cache');
var Engine = require('engine-cache');
var Loader = require('loader-cache');
var Option = require('option-cache');
var Plasma = require('plasma-cache');
var plasma = require('plasma');

/**
 * Local dependencies
 */

var error = require('./lib/error/base');
var assert = require('./lib/error/assert');
var transforms = require('./lib/transforms');
var Collection = require('./lib/collection');
var loaders = require('./lib/loaders/');
var utils = require('./lib/utils');

/**
 * Create an instance of `Template` with the given `options`.
 *
 * @param {Object} `options`
 * @api public
 */

function Template(options) {
  Option.call(this, options);
  Config.call(this);
  Loader.call(this);
  Plasma.call(this, {
    plasma: plasma
  });
  this.init();
}


/**
 * Extend template
 */

Config.mixin(Template.prototype);
utils.extend(Template.prototype, Option.prototype);
utils.extend(Template.prototype, Plasma.prototype);
utils.extend(Template.prototype, Loader.prototype);

/**
 * Initialize template
 */

Template.prototype.init = function() {
  this.initDefaults();
  this.initTransforms();
  this.initLoaders();
  this.initConfig();
  this.listen();
};

/**
 * Initialize defaults
 */

Template.prototype.initDefaults = function() {
  // error handling
  this.mixin('assert', assert.bind(this));
  this.mixin('error', error.bind(this));

  // make plasma options non-enumerable
  Object.defineProperty(this.options, 'plasma', {
    enumerable: false,
    configurable: true,
    value: this.options.plasma || {}
  });

  this._ = {};

  // config
  this.errorsList = [];
  this.transforms = {};
  this.dataLoaders = {};
  this.iterators = {};
  this.loaders = {};
  this.engines = {};
  this.helpers = {};
  this.contexts = {};
  this.contexts.create = {};
  this.options.views = {};
  this.cache.context = {};
  this.viewTypes = {};
  this.views = {};
  this.inflections = {};

  this._.helpers = {};
  this._.engines = new Engine(this.engines);

  this.loaderType('helpers');
  this.loaderType('sync');
  this.loaderType('async');
  this.loaderType('promise');
  this.loaderType('stream');

  // view types
  this.viewType('renderable');
  this.viewType('layout');
  this.viewType('partial');
};

/**
 * Initialize default transforms.
 */

Template.prototype.initTransforms = function() {
  this.transform('engines', transforms.engines);
  this.transform('helpers', transforms.helpers);
  this.transform('lookups', transforms.lookups);
  this.transform('routes', transforms.routes);
  this.transform('layouts', transforms.layouts);
  this.transform('middleware', transforms.middleware);
  this.transform('context', transforms.context);
  this.transform('render', transforms.render);
};

/**
 * Initialize configuration defaults
 */

Template.prototype.initConfig = function() {
  // init helper types
  this.helperType('sync');
  this.helperType('async');

  this.enable('default routes');
  this.enable('default helpers');
  this.enable('mergePartials');
  this.disable('preferLocals');

  // default layout settings
  this.option('layoutDelims', ['{%', '%}']);
  this.option('layoutTag', 'body');

  // default engine settings
  this.disable('debugEngine');
  this.option('view engine', '*');
  this.engine('.*', function noop(str, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts; opts = {};
    }
    cb(null, str);
  });

  // default view types
  this.create('page', { viewType: 'renderable' });
  this.create('partial', { viewType: 'partial' });
  this.create('layout', { viewType: 'layout' });
};

/**
 * Initialize loaders
 */

Template.prototype.initLoaders = function() {
  var first = loaders.first(this);

  // iterators
  this.iterator('async', loaders.iterators.async);
  this.iterator('promise', loaders.iterators.promise);
  this.iterator('stream', loaders.iterators.stream);
  this.iterator('sync', loaders.iterators.sync);

  // load default helpers and templates
  this.loader('helpers', { loaderType: 'sync' }, loaders.helpers);
  this.loader('default', { loaderType: 'sync' }, first.sync);
  this.loader('default', { loaderType: 'async' }, first.async);
  this.loader('default', { loaderType: 'promise' }, first.promise);
  this.loader('default', { loaderType: 'stream' }, first.stream);
};

/**
 * Setup listeners for options events
 */

Template.prototype.listen = function() {
  this.on('option', function(key, val) {
    if (key === 'helpers' || typeof key === 'object' && key.helpers) {
      this.helpers(key.helpers);
    }
  });
};

/**
 * Transforms are run immediately during init, and are used to
 * utils.extend or modify the `this` object.
 *
 * @param {String} `name` The name of the transform to add.
 * @param {Function} `fn` The actual transform function.
 * @return {Object} Returns `Template` for chaining.
 * @api public
 */

Template.prototype.transform = function(name, fn) {
  this.assert('transform', 'name', 'string', name);
  this.assert('transform', 'fn', 'function', fn);
  this.transforms[name] = fn;
  fn.call(this, this);
  return this;
};

/**
 * Create a new view type.
 *
 * @param  {String} `name`
 * @api public
 */

Template.prototype.viewType = function(name) {
  if (this.viewTypes.hasOwnProperty(name)) return;
  this.viewTypes[name] = [];
  return this;
};

/**
 * Return true if a collection belongs to the given `viewType`.
 *
 * @param  {String} `type`
 * @param  {Object} `options` Pass the collection's options object.
 * @api public
 */

Template.prototype.isViewType = function(type, options) {
  var opts = utils.extend({viewType: []}, options);
  return opts.viewType.indexOf(type) !== -1;
};

/**
 * Private method for setting and mapping the plural name
 * for a view collection.
 *
 * @param  {String} `name`
 * @return {String}
 */

Template.prototype.inflect = function(name) {
  return this.inflections[name] || (this.inflections[name] = utils.inflect(name));
};

/**
 * Private method for setting view types for a collection.
 *
 * @param {String} `plural` e.g. `pages`
 * @param {Object} `options`
 * @api private
 */

Template.prototype.setViewType = function(plural, opts) {
  this.assert('setViewType', 'plural', 'string', plural);
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

Template.prototype.create = function(singular, options, loaders) {
  this.assert('create', 'singular', 'string', singular);

  var args = [].slice.call(arguments, 1);
  var opts = utils.isObject(options) ? args.shift(): {};

  var plural = this.inflect(singular);
  opts.viewType = this.setViewType(plural, opts);
  opts.loaderType = opts.loaderType || 'sync';
  opts.inflection = singular;
  opts.collection = plural;

  this.options.views[plural] = opts;
  this.contexts.create[plural] = opts;
  loaders = [].concat.apply([], args);

  // create a new collection
  var views = this.views[plural] = new Collection(opts, loaders, this);
  this.collectionHelpers(singular, plural, opts);
};

/**
 * Create sync and async helpers if viewType is `partial`
 *
 * @param {String} `options`
 */

Template.prototype.collectionHelpers = function(singular, plural, options) {
  if (this.enabled('default helpers') && this.isViewType('partial', options)) {
    if (!this.getHelper(singular)) {
      this.defaultHelper(singular, plural);
    }
    if (!this.getAsyncHelper(singular)) {
      this.defaultAsyncHelper(singular, plural);
    }
  }
};

/**
 * Validate a template object to ensure that it has the properties
 * expected for applying layouts, choosing engines, and so on.
 *
 * @param  {String} `template` a template object
 * @api public
 */

Template.prototype.validate = function(/*template*/) {
  return utils.validate.apply(this, arguments);
};

/**
 * Register a context for a view.
 */

Template.prototype.context = function(view, prop, val) {
  if (utils.isObject(view)) {
    return utils.setProp(view, ['contexts', prop], val);
  }
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
  utils.mixin(this, name, fn);
};

/**
 * Expose `Template`
 */

module.exports = Template;
