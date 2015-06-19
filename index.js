'use strict';

// require('time-require');
var isObject = require('isobject');
var cloneDeep = require('clone-deep');
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
  ConfigCache.call(this);
  OptionCache.call(this, options);
  PlasmaCache.call(this, { plasma: plasma });
  LoaderCache.call(this, { plasma: plasma });
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
  // this._.loaders = new LoaderCache(this.loaders);
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

  // helper types
  this.helperType('sync');
  this.helperType('async');
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

Template.prototype.listen = function() {
  this.on('option', function(key, val) {
    if (key === 'helpers' || typeof key === 'object' && key.helpers) {
      this.helpers(key.helpers);
    }
  });
};

/**
 * Private method for registering helper types.
 */

Template.prototype.helperType = function(type) {
  this._.helpers[type] = new HelperCache({bind: false});
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

Template.prototype.create = function(singular, options, stack) {
  this.assert('create', 'singular', 'string', singular);

  var plural = this.inflect(singular);
  var args = [].slice.call(arguments, 1);
  var opts = isObject(options) ? args.shift(): {};

  opts.viewType = this.setViewType(plural, opts);
  opts.loaderType = opts.loaderType || 'sync';
  opts.inflection = singular;
  opts.collection = plural;

  this.options.views[plural] = opts;
  this.contexts.create[plural] = opts;
  stack = [].concat.apply([], args);

  this.views[plural] = new Collection(opts);
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

Template.prototype.decorate = function(singular, plural, opts, stack) {
  // get the last loader to use
  var views = this.views[plural];
  var last = loaders.last(this)(views, this.normalize(views.options));
  opts.lastLoader = last[opts.loaderType];

  // add the loader methods for the collection, ex. `.page()` and `.pages()`
  var loadFn = this.compose(opts, stack);
  this.mixin(singular, loadFn);
  this.mixin(plural, loadFn);

  var find = function (key) {
    return this.getView(plural, key, opts.renameKey);
  }.bind(this);

  // Bind a lookup function to this collection. Example: `pages.get('foo')`
  utils.defineProperty(this[plural], 'get', find);

  // Bind a matching function to this collection. Example: `pages.match('*')`
  utils.defineProperty(this[plural], 'match', function(patterns, options) {
    return utils.matchKeys(views, patterns, options);
  }.bind(this));

  // Bind a `render` method to this collection. Example: `pages.render('foo')`
  utils.defineProperty(this[plural], 'render', function () {
    var args = [].slice.call(arguments);
    var key = args.shift();
    var file = find.call(this, key);
    return file.render.apply(this, args);
  }.bind(this));

  // create sync and async helpers if viewType is `partial`
  var isPartial = (opts.viewType || []).indexOf('partial') !== -1;
  if (this.enabled('default helpers') && isPartial) {
    if (!this._.helpers.sync.hasOwnProperty(singular)) {
      this.defaultHelper(singular, plural);
    }
    if (!this._.helpers.async.hasOwnProperty(singular)) {
      this.defaultAsyncHelper(singular, plural);
    }
  }
};


Template.prototype.normalize = function(options) {
  var opts = cloneDeep(options || {});
  return function (file) {
    var context = opts.contexts || {};
    delete opts.contexts;
    file.contexts = extend({}, file.contexts, context);
    file.contexts.create = opts;
    file.options = extend({}, opts, file.options);
    this.handle('onLoad', file, this.handleError('onLoad', {path: file.path}));
    return file;
  }.bind(this);
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
 * Middleware error handler
 *
 * @param {Object} `template`
 * @param {String} `method` name
 * @api private
 */

Template.prototype.handleError = function(method, template) {
  return function (err) {
    if (err) {
      err.reason = 'Error running ' + method + ' middleware: ' + JSON.stringify(template);
      console.error(err);
      return err;
    }
  };
};

/**
 * Expose `Template`
 */

module.exports = Template;

