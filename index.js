'use strict';

// require('time-require');
var isObject = require('isobject');
var extend = require('extend-shallow');
var inflect = require('pluralize');
var plasma = require('plasma');
var YAML = require('js-yaml');

var ConfigCache = require('config-cache');
var EngineCache = require('engine-cache');
var HelperCache = require('helper-cache');
var LoaderCache = require('loader-cache');
var OptionCache = require('option-cache');
var PlasmaCache = require('plasma-cache');

var assert = require('./lib/error/assert');
var error = require('./lib/error/base');
var transforms = require('./lib/transforms');
var Collection = require('./lib/collection');
var iterators = require('./lib/iterators');
var validate = require('./lib/validate');
var loaders = require('./lib/loaders/');
var utils = require('./lib/utils');

/**
 * Create an instance of `Template` with the given `options`.
 *
 * @param {Object} `options`
 * @api public
 */
function Template(options) {
  OptionCache.call(this, options);
  ConfigCache.call(this);
  PlasmaCache.call(this, { plasma: plasma });
  LoaderCache.call(this);
  this.initDefaults();
  this.initTransforms();
  this.initLoaders();
  this.initConfig();
  this.listen();
}

ConfigCache.mixin(Template.prototype);
extend(Template.prototype, OptionCache.prototype);
extend(Template.prototype, PlasmaCache.prototype);
extend(Template.prototype, LoaderCache.prototype);

/**
 * Initialize template and loader types
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
  this._.engines = new EngineCache(this.engines);

  this.loaderType('helpers');
  this.loaderType('sync');
  this.loaderType('async');
  this.loaderType('promise');
  this.loaderType('stream');

  // data
  this.dataLoader('yml', function () {
    return YAML.load.apply(YAML, arguments);
  });

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
  this.iterator('async', iterators.async);
  this.iterator('promise', iterators.promise);
  this.iterator('stream', iterators.stream);
  this.iterator('sync', iterators.sync);

  // load default helpers and templates
  this.loader('helpers', { loaderType: 'sync' }, loaders.helpers(this));
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
 * extend or modify the `this` object.
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
  var opts = extend({viewType: []}, options);
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
  return this.inflections[name] || (this.inflections[name] = inflect(name));
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
  var opts = isObject(options) ? args.shift(): {};

  var plural = this.inflect(singular);
  opts.viewType = this.setViewType(plural, opts);
  opts.loaderType = opts.loaderType || 'sync';
  opts.inflection = singular;
  opts.collection = plural;

  this.options.views[plural] = opts;
  this.contexts.create[plural] = opts;
  loaders = [].concat.apply([], args);

  this.views[plural] = new Collection(opts, loaders, this);
  this.forwardMethod(plural, 'related');
  this.forwardMethod(plural, 'filter');
  this.forwardMethod(plural, 'recent');
  this.forwardMethod(plural, 'use');
  this.collectionHelpers(singular, plural, opts);
  return this;
};

/**
 * Forward a view collection method onto the corresponding instance
 * collection method (`this.views.pages.recent` => `this.pages.recent`)
 *
 * @param  {String} `template` a template object
 * @api public
 */

Template.prototype.forwardMethod = function(plural, name) {
  var fn = this.views[plural][name];
  utils.defineProperty(this[plural], name, fn.bind(this.views[plural]));
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
  return validate.apply(validate, arguments);
};

/**
 * Register a context for a view.
 */

Template.prototype.context = function(view, prop, val) {
  if (isObject(view)) {
    return utils.set(view, ['contexts', prop], val);
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
  utils.defineProperty(this, name, fn);
};

/**
 * Expose `Template`
 */

module.exports = Template;

