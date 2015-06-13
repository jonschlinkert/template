'use strict';

// require('time-require');
var isObject = require('isobject');
var extend = require('extend-shallow');
var inflect = require('pluralize');
var flatten = require('arr-flatten');
var pickFrom = require('pick-from');
var cloneDeep = require('clone-deep');
var set = require('set-value');

var Config = require('config-cache');
var Engines = require('engine-cache');
var Helpers = require('helper-cache');
var Loaders = require('loader-cache');
var Options = require('option-cache');
var Plasma = require('plasma-cache');

var Collection = require('./lib/collection');
var transforms = require('./lib/transforms');
var iterators = require('./lib/iterators');
var loaders = require('./lib/loaders/index.js');
var assert = require('./lib/error/assert');
var debug = require('./lib/debug');
var error = require('./lib/error/base');
var utils = require('./lib/utils');
var validate = require('./lib/validate');

/**
 * Create an instance of `Template` with the given `options`.
 *
 * @param {Object} `options`
 * @api public
 */
function Template(options) {
  Config.call(this, this);
  Options.call(this, options);
  Plasma.call(this, {plasma: require('plasma')});
  this.initDefaults();
  this.initTypes();
  this.initTransforms();
  this.initConfig();
}

Config.mixin(Template.prototype);
extend(Template.prototype, Options.prototype);
extend(Template.prototype, Plasma.prototype);

/**
 * Initialize template and loader types
 */

Template.prototype.initDefaults = function() {
  // error handling
  this.mixin('assert', assert.bind(this));
  this.mixin('error', error.bind(this));

  // config
  this.transforms = {};
  this.dataLoaders = {};
  this.iterators = {};
  this.loaders = {};
  this.engines = {};
  this.helpers = {};
  this.errorsList = [];

  this.contexts = {};
  this.contexts.create = {};
  this.options.views = {};
  this.cache.context = {};
  this.viewTypes = {};
  this.views = {};
  this.inflection = {};

  this._ = {};
  this._.loaders = {};
  this._.helpers = {};
  this._.engines = new Engines(this.engines);
};

/**
 * Initialize template and loader types
 */

Template.prototype.initTypes = function() {
  // iterators
  this.iterator('sync', require('iterator-sync'));
  this.iterator('async', require('iterator-async'));
  this.iterator('promise', require('iterator-promise'));
  this.iterator('streams', require('iterator-streams'));
  // loader types
  this.loaderType('sync');
  this.loaderType('async');
  this.loaderType('promise');
  this.loaderType('stream');
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

  this.create('page', { viewType: 'renderable' });
  this.create('partial', { viewType: 'partial' });
  this.create('layout', { viewType: 'layout' });

  // layouts
  this.option('layoutDelims', ['{%', '%}']);
  this.option('layoutTag', 'body');

  // engines
  this.option('view engine', '*');
  this.disable('debugEngine');
  this.engine('.*', function noop(str, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts; opts = {};
    }
    cb(null, str);
  });

  // load default helpers and templates
  this.loader('helpers', loaders.helpers(this));
  this.loader('default', { loaderType: 'sync' }, loaders.defaults(this).sync);
  this.loader('default', { loaderType: 'async' }, loaders.defaults(this).async);
  this.loader('default', { loaderType: 'promise' }, loaders.defaults(this).promise);
  this.loader('default', { loaderType: 'stream' }, loaders.defaults(this).stream);
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
 * Register an iterator to use with loaders.
 *
 * @param {String} `type`
 * @param {Function} `fn` Iterator function
 * @api public
 */

Template.prototype.iterator = function(type, fn) {
  this.assert('iterator', 'type', 'string', type);
  this.assert('iterator', 'fn', 'function', fn);
  if (!this.iterators.hasOwnProperty(type)) {
    this.iterators[type] = fn;
  }
  return this;
};

/**
 * Private method for registering loader types.
 *  | async
 *  | sync
 *  | stream
 *  | promise
 */

Template.prototype.loaderType = function(type, opts) {
  this.loaders[type] = this.loaders[type] || {};
  this._.loaders[type] = new Loaders(extend({
    cache: this.loaders[type]
  }, opts));
};

/**
 * Private method for registering helper types.
 */

Template.prototype.helperType = function(type) {
  this._.helpers[type] = new Helpers({bind: false});
};

/**
 * Register a context for a view.
 */

Template.prototype.context = function(view, prop, val) {
  if (!isObject(view)) return;
  var contexts = ['contexts'].concat(utils.arrayify(prop));
  return set(view, contexts.join('.'), val);
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
 * Private method for setting view types for a collection.
 *
 * @param {String} `plural` e.g. `pages`
 * @param {Object} `options`
 * @api private
 */

Template.prototype.setType = function(plural, opts) {
  this.assert('setType', 'plural', 'string', plural);
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
 * Get all view collections of the given [type].
 *
 * ```js
 * var renderable = template.getViewType('renderable');
 * //=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
 * ```
 *
 * @param {String} `type` Types are `renderable`, `layout` and `partial`.
 * @api public
 */

Template.prototype.getViewType = function(type, subtypes) {
  this.assert('getViewType', 'type', 'string', type);
  var keys = typeof subtypes !== 'undefined'
    ? utils.arrayify(subtypes)
    : this.viewTypes[type];

  var len = keys.length, i = 0;
  var res = {};

  while (len--) {
    var plural = keys[i++];
    res[plural] = this.views[plural];
  }
  return res;
};

/**
 * Return true if the specified `viewType` is defined on the
 * given options object.
 *
 * @param  {String} `viewType` The name of the viewType to check.
 * @return {Boolean} Returns true if the `viewType` exists.
 * @api public
 */

Template.prototype.isViewType = function(type, opts) {
  if (opts && !opts.hasOwnProperty('viewType')) {
    return false;
  }
  if (!Array.isArray(opts && opts.viewType)) {
    throw this.error('isViewType', 'expects options.viewType to be an array', type);
  }
  return utils.arrayify(opts && opts.viewType).indexOf(type) !== -1;
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
  opts.viewType = this.setType(plural, opts);
  opts.inflection = singular;
  opts.collection = plural;

  this.options.views[plural] = opts;
  this.contexts.create[plural] = opts;
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

Template.prototype.decorate = function(singular, plural, options, loaderStack) {
  var opts = extend({}, options, {plural: plural});

  var load = function(key, value, locals, options) {
    var args = [].slice.call(arguments);
    var idx = utils.loadersIndex(args);
    var actualArgs = idx !== -1 ? args.slice(0, idx) : args;
    var stack = idx !== -1 ? args.slice(idx) : [];
    var optsIdx = (idx === -1 ? 1 : (idx - 1));
    options = utils.isOptions(actualArgs[optsIdx])
      ? extend({}, opts, actualArgs.pop())
      : opts;

    var type = options.loaderType || 'sync';
    stack = this.buildStack(type, loaderStack.concat(stack));
    if (stack.length === 0) {
      stack = this.loaders[type]['default'];
    }
    var res = this.views[plural].load(actualArgs, options, stack);
    if (type === 'stream' || type === 'promise') return res;

    for (var key in res) {
      this.handle('onLoad', this.views[plural][key], this.handleError('onLoad', {path: key}));
    }
    return this.views[plural];
  };

  this.mixin(singular, load);
  this.mixin(plural, load);

  // Add a `get` method to `Template` for `singular`
  this.mixin(utils.methodName('get', singular), function (key) {
    return this.views[plural][key];
  });

  // Add a `render` method to `Template` for `singular`
  this.mixin(utils.methodName('render', singular), function () {
    var args = [].slice.call(arguments);
    var file = this.lookup(plural, args.shift());
    return file.render.apply(this, args);
  });

  var isPartial = this.isViewType('partial', opts);

  // create default helpers
  if (this.enabled('default helpers') && isPartial) {
    // Create a sync helper for this type
    if (!this._.helpers.sync.hasOwnProperty(singular)) {
      this.defaultHelper(singular, plural);
    }
    // Create an async helper for this type
    if (!this._.helpers.async.hasOwnProperty(singular)) {
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
 * Merge all collections of the given `type` into a single
 * collection. e.g. `partials` and `includes` would be merged.
 *
 * If an array of `collections` is passed, only those collections
 * will be merged and the order in which the collections are defined
 * in the array will be respected.
 *
 * @param {String} `type` The template type to search.
 * @param {String} `subtypes` Optionally pass an array of view collection names
 * @api public
 */

Template.prototype.mergeType = function(type/*, subtypes*/) {
  var collections = this.getViewType.apply(this, arguments);
  var res = {};
  for (var key in collections) {
    var collection = collections[key];

    for (var name in collection) {
      if (!res.hasOwnProperty(name) && collection.hasOwnProperty(name)) {
        res[name] = collection[name];
      }
    }
  }
  return res;
};

/**
 * Merge all `layout` collections based on user-defined options.
 *
 * @param {String} `type` The template type to search.
 * @param {String} `collections` Optionally pass an array of collections
 * @api public
 */

Template.prototype.mergeLayouts = function(fn) {
  debug.template('mergeLayouts', arguments);

  var custom = this.option('mergeLayouts');
  if (typeof custom === 'undefined') custom = fn;
  var layouts = {};

  if (typeof custom === 'function') {
    return custom.call(this, arguments);
  }

  if (Array.isArray(custom)) {
    layouts = this.mergeType('layout', custom);
  } else if (custom === false) {
    layouts = this.views.layouts;
  } else {
    layouts = this.mergeType('layout');
  }

  var mergeTypeContext = this.mergeTypeContext(this, 'layouts');
  for (var key in layouts) {
    if (layouts.hasOwnProperty(key)) {
      var value = layouts[key];
      mergeTypeContext(key, value.locals, value.data);
    }
  }
  return layouts;
};

/**
 * Default method for determining how partials are to be passed to
 * engines.
 *
 * ```js
 * template.option('mergePartials', function(locals) {
 *   // do stuff
 * });
 * ```
 *
 * @param {Object} `locals` Locals should have layout delimiters, if defined
 * @return {Object}
 * @api public
 */

Template.prototype.mergePartials = function(context) {
  debug.template('mergePartials', arguments);

  var mergePartials = this.option('mergePartials');
  if (typeof mergePartials === 'function') {
    return mergePartials.call(this, context);
  }

  var opts = context.options || {};
  if (mergePartials === true) {
    opts.partials = cloneDeep()(context.partials || {});
  }

  var mergeTypeContext = this.mergeTypeContext(this, 'partials');
  var arr = this.viewTypes.partial;
  var len = arr.length, i = 0;

  // loop over each `partial` collection (e.g. `docs`)
  while (len--) {
    var plural = arr[i++];
    // Example `this.views.docs`
    var collection = this.views[plural];

    // Loop over each partial in the collection
    for (var key in collection) {
      if (collection.hasOwnProperty(key)) {
        var value = collection[key];
        mergeTypeContext(key, value.locals, value.data);

        // get the globally stored context that we just created
        // using `mergeTypeContext` for the current partial
        var layoutOpts = this.cache.typeContext.partials[key];
        layoutOpts.layoutDelims = pickFrom('layoutDelims', [layoutOpts, opts]);

        // wrap the partial with a layout, if applicable
        this.applyLayout(value, layoutOpts);

        // If `mergePartials` is true combine all `partial` subtypes
        if (mergePartials === true) {
          opts.partials[key] = value.content;

        // Otherwise, each partial subtype on a separate object
        } else {
          opts[plural] = opts[plural] || {};
          opts[plural][key] = value.content;
        }
      }
    }
  }
  context.options = extend({}, context.options, opts);
  return context;
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
