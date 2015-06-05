/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var merge = require('mixin-deep');
var PluginError = require('plugin-error');
var extend = require('extend-shallow');
var inflect = require('pluralize');
var omit = require('object.omit');
var flatten = require('arr-flatten');
var pickFrom = require('pick-from');
var typeOf = require('kind-of');

/**
 * Lazy requires
 */

/* deps: layouts async through2 */
var lazy = require('lazy-cache')(require);
var chalk = require('lazy-chalk');
var through = lazy('through2');
var async = lazy('async');
var cloneDeep = lazy('clone-deep');

/**
 * Extend Template
 */

var Config = require('config-cache');
var Loaders = require('loader-cache');
var Options = require('option-cache');

/**
 * Local modules
 */

var loaders = require('./lib/loaders');
var debug = require('./lib/debug');
var utils = require('./lib');

/**
 * Create a new instance of `Template`, optionally passing
 * default `options` to initialize with.
 *
 * ```js
 * var Template = require('template');
 * var template = new Template();
 * ```
 *
 * @class `Template`
 * @param {Object} `options` Options to initialize with.
 * @api public
 */

function Template(options, obj) {
  Config.call(this, this);
  Options.call(this, options, this);
  this.initTemplate(options);
}

Config.mixin(Template.prototype);

/**
 * Initialize defaults.
 */

Template.prototype.initTemplate = function() {
  this.loaders = {
    sync: {},
    async: {},
    promise: {},
    stream: {}
  };

  this._ = {};
  this.inflections = {};
  this.errorsList = [];

  // View types
  this.types = {};
  this.contexts = {};
  this.options.subtypes = {};

  // View collections
  this.views = {};

  // defaults
  this.defaultConfig();
  this.defaultOptions();
  this.defaultLoaders();
};

/**
 * Initialize the default configuration.
 */

Template.prototype.defaultConfig = function() {
  this._.loaders = new Loaders(this.loaders.sync);
  this._.loadersAsync = new Loaders('async', this.loaders.async);
  this._.loadersPromise = new Loaders('promise', this.loaders.promise);
  this._.loadersStream = new Loaders('stream', this.loaders.stream);
};

/**
 * Initialize default options.
 */

Template.prototype.defaultOptions = function() {
  this.enable('silent');
};

/**
 * Register default loader methods
 */

Template.prototype.defaultLoaders = function() {
  this.registerLoader('default', loaders.templates(this).sync)
      .registerLoader('default', { loaderType: 'async' }, loaders.templates(this).async)
      .registerLoader('default', { loaderType: 'promise' }, loaders.templates(this).promise)
      .registerLoader('default', { loaderType: 'stream' }, loaders.templates(this).stream);
};

Template.prototype.type = function(type) {
  this.types[type] = [];
};
/**
 * Register a loader stack for a specific loader type.
 *
 * ```
 * template.registerLoader('fp', function (fp) {
 *   return fs.readFileSync(fp, 'utf');
 * });
 * ```
 *
 * @param  {String} `name` Name of loader to add.
 * @param  {Object} `options` Options to specify loader type.
 * @option {String} `loaderType` Type of loader this function is for.
 * @param  {Array|Function} `stack` Loader function or stack of loader functions.
 * @return {Template} `this` for chaining
 * @api public
 */

Template.prototype.registerLoader = function(name, options, stack) {
  if (Array.isArray(options) || typeof options === 'function') {
    stack = options;
    options = {};
  }
  options = options || {};

  if (typeof stack === 'function') stack = [stack];
  if (!Array.isArray(stack)) {
    throw new Error('Expected an Array  or Function for `stack` but got ' + (typeof stack));
  }

  var loaderType = options.loaderType || 'sync';
  var loader = (loaderType === 'sync' ? this._.loaders : this._[utils.methodName('loaders', loaderType)]);
  if (typeof loader === 'undefined') {
    throw new Error('Invalid `loaderType` ' + loaderType);
  }
  stack.unshift(name);
  loader.register.apply(loader, stack);
  return this;
};

/**
 * Get a function that will pick the correct loader and execute the loader
 * when the specified subtype is being loaded.
 *
 * ```
 * var pagesLoader = template.lazyLoader('page', { loaderType: 'sync' }, ['fp']);
 * var pages = pagesLoader(['templates/pages/*.hbs']);
 * ```
 *
 * @param  {String} `subtype` View type being loaded.
 * @param  {String} `plural` e.g. `pages`
 * @param  {Object} `options` Options to sepecify the loader type.
 * @option {String} `loaderType` Type of loader this function is for.
 * @return {Function} Function that will get loader and do the loading when called.
 */

Template.prototype.lazyLoader = function(subtype, plural, options) {
  options = options || {};
  // get the loader instance for the specified loaderType
  var loaderType = options.loaderType || 'sync';
  var loader = loaderType === 'sync' ? this._.loaders : this._[utils.methodName('loaders', loaderType)];
  if (typeof loader === 'undefined') {
    throw new Error('Invalid `loaderType` ' + options.loaderType);
  }
  var offLoader = loaders.last(this)[loaderType](plural);

  // return function that will be used for loading specific subtypes (e.g. `pages`)
  return function () {
    var args = [].slice.call(arguments);
    var done = null;
    if (loaderType === 'async') {
      done = args.pop();
    }

    var results = utils.filterLoaders(args, loader.cache);
    var stack = results.stack;
    var args = results.args;
    if (stack.length === 0) {
      stack.push(subtype);
    }
    stack.push(offLoader);

    // the the loader function for this subtype, with specified stack, and use default `off-loader`
    var fn = loader.loader(stack);

    if (done != null) args.push(done);
    // do the loading
    if (loaderType === 'sync') {
      fn.apply(fn, args);
      return this;
    }
    return fn.apply(fn, args);
  };
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

Template.prototype.setType = function(subtype, plural, options) {
  debug.template('setting subtype: %s', subtype);
  // shallow clone options
  var opts = extend({}, options);

  // set the inflection mapping for `subtype`
  this.inflections[subtype] = plural;
  if (typeof opts.type !== 'undefined') {
    var types = utils.arrayify(opts.type);
    types.forEach(function (type) {
      if (typeof this.types[type] === 'undefined') {
        throw new Error('Invalid `type` specified (' + type + ')');
      }
      if (this.types[type].indexOf(plural) === -1) {
        this.types[type].push(plural);
      }
    }.bind(this));
  }
  return opts;
};

/**
 * Create a new `view` collection and associated convience methods.
 *
 * Note that when you only specify a name for the type, a plural form is created
 * automatically (e.g. `page` and `pages`). However, you can define the
 * `plural` form explicitly if necessary.
 *
 * ```js
 * template.create('include', {isPartial: true});
 * // now you can load and use includes!
 * template.includes('*.hbs');
 * ```
 *
 * @param {String} `subtype` Singular name of the collection to create, e.g. `page`.
 * @param {Object} `options` Options for the collection.
 * @option {String|Array} `type` Type of the subtype to create.
 * @option {String} `loaderType` Type of loader to use for this subtype (sync, async, promise, stream). defaults to sync.
 * @param {Function|Array} `stack` Loader function or functions to be run for every template of this type.
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.create = function(subtype, options, stack) {
  debug.template('creating subtype: %s', subtype);

  if (typeof subtype !== 'string') {
    throw this.error('create', 'expects subtype to be a string', arguments);
  }

  // create the plural name for `subtype`
  var plural = inflect(subtype);

  if (Array.isArray(options)) {
    stack = options;
    options = {};
  }

  // shallow clone options
  var opts = extend({loaderType: 'sync'}, options);
  stack = utils.arrayify(stack || ['default']);

  this.registerLoader(subtype, options, stack);

  // add an object to `views` for this template type
  this.views[plural] = this.views[plural] || {};
  opts = this.setType(subtype, plural, opts);

  // Add convenience methods for this sub-type
  this.decorate(subtype, plural, opts);
  return this;
};

/**
 * Decorate a new template subtype with convenience methods.
 * For example, the `post` template type would have `.post`
 * and `.posts` methods created.
 */

Template.prototype.decorate = function(subtype, plural, opts) {
  debug.template('decorating subtype:', arguments);

  // create a loader for this template subtype
  var fn = this.lazyLoader(subtype, plural, opts);

  // store a context and options for the subtype
  this.options.subtypes[plural] = this.contexts[plural] = opts;

  // make a `plural` convenience method, ex: `.pages`
  mixin(plural, fn);

  // make a `singular` convenience method, ex: `.page`
  mixin(subtype, fn);

  // Add a `get` method to `Template` for `subtype`
  mixin(utils.methodName('get', subtype), function (key) {
    return this.views[plural][key];
  });
};

/**
 * Extend the `Template` prototype with a new method.
 *
 * @param  {String} `method` The method name.
 * @param  {Function} `fn`
 * @api private
 */

function mixin(method, fn) {
  Template.prototype[method] = fn;
}

/**
 * Expose `Template`
 */

module.exports = Template;
