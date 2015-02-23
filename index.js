/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var util = require('util');
var glob = require('globby');
var chalk = require('chalk');
var forOwn = require('for-own');
var typeOf = require('kind-of');
var pickFrom = require('pick-from');
var cloneDeep = require('clone-deep');
var arrayify = require('arrayify-compact');
var extend = require('extend-shallow');
var reduce = require('object.reduce');
var flatten = require('arr-flatten');
var merge = require('mixin-deep');
var slice = require('array-slice');

/**
 * Extend Template
 */

var layouts = require('layouts');
var routes = require('en-route');
var Delims = require('delimiters');
var Config = require('config-cache');
var Helpers = require('helper-cache');
var Engines = require('engine-cache');
var Loaders = require('loader-cache');
var Router = routes.Router;
var Route = routes.Route;

/**
 * Local modules
 */

var init = require('./lib/middleware/init');
var debug = require('./lib/debug');
var utils = require('./lib');

/**
 * Create a new instance of `Template`, optionally passing
 * default `options` to initialize with.
 *
 * **Example:**
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

var Template = module.exports = Config.extend({
  constructor: function(options) {
    Template.__super__.constructor.call(this, options);
    this.initTemplate();
    this.loadDefaults();
  }
});

/**
 * Extend `Template`
 */

Template.extend = Config.extend;
Template.Router = routes.Router;
Template.Route = routes.Route;

/**
 * Initialize defaults.
 */

Template.prototype.initTemplate = function() {
  this.loaders = this.loaders || {};
  this.engines = this.engines || {};
  this.delims = this.delims || {};
  this.transforms = {};

  // Engine properties
  this._ = {};
  this._.mixins = {};
  this._.imports = {};

  // View types (categories)
  this.type = {};
  this.type.partial = [];
  this.type.renderable = [];
  this.type.layout = [];

  // View collections
  this.views = {};
  this.view('layouts', {});
  this.view('partials', {});
  this.view('anonymous', {});
  this.view('pages', {});
  this.collection = {};

  this.set('_context', {});
};

/**
 * Load all defaults
 */

Template.prototype.loadDefaults = function() {
  this.defaultConfig();
  this.mixInLoaders();
  this.defaultLoaders();
  this.defaultOptions();
  this.defaultTransforms();
  this.defaultDelimiters();
  this.defaultTemplates();
  this.defaultEngines();
  this.defaultRoutes();
};

/**
 * Initialize the default configuration.
 */

Template.prototype.defaultConfig = function() {
  this._.delims = new Delims(this.options);
  this._.loaders = new Loaders(this.loaders);
  this._.engines = new Engines(this.engines);
  this._.helpers = new Helpers({bind: false});
  this._.asyncHelpers = new Helpers({bind: false});
};

/**
 * Run the default transforms.
 */

Template.prototype.defaultTransforms = function() {
  this.transform('placeholder', function () {});
};

/**
 * Initialize default options.
 */

Template.prototype.defaultOptions = function() {
  this.disable('preferLocals');

  // routes
  this.enable('default routes');
  this.option('router methods', []);

  // engines
  this.disable('debugEngine');
  this.enable('default engines');
  this.option('viewEngine', '*');
  this.option('delims', ['<%', '%>']);

  // helpers
  this.enable('default helpers');

  // file extensions
  this.option('ext', '*');
  this.option('destExt', '.html');
  this.option('defaultExts', ['md']);
  this.option('cwd', process.cwd());

  // layouts
  this.enable('mergeLayouts');
  this.option('layoutDelims', ['{%', '%}']);
  this.option('layoutTag', 'body');
  this.option('defaultLayout', null);
  this.option('layoutExt', null);
  this.option('layout', null);

  // partials
  this.enable('mergePartials');

  // Custom function for naming partial keys
  this.option('partialsKey', function (fp) {
    return path.basename(fp, path.extname(fp));
  });

  // Custom function for all other template keys
  this.option('renameKey', function (fp) {
    return path.basename(fp);
  });

  // Custom function for getting a loader
  this.option('matchLoader', function () {
    return 'default';
  });
};

/**
 * Set the current working directory
 */

defineGetter(Template.prototype, 'cwd', function () {
  return this.option('cwd') || process.cwd();
});

/**
 * Mixin methods from [loader-cache] for loading templates.
 */

Template.prototype.mixInLoaders = function() {
  var mix = utils.mixInLoaders(Template.prototype, this._.loaders);
  // register methods
  mix('loader', 'register');
  mix('loaderAsync', 'registerAsync');
  mix('loaderPromise', 'registerPromise');
  mix('loaderStream', 'registerStream');
  // load methods
  mix('load');
  mix('loadAsync');
  mix('loadPromise');
  mix('loadStream');
};

/**
 * Register default loader methods
 */

Template.prototype.defaultLoaders = function() {
  this.loader('default', require('./lib/loaders').templates(this));
  this.loader('helpers', require('./lib/loaders').helpers(this));
};

/**
 * Load default routes / middleware
 *
 *   - `.md`: parse front matter in markdown files
 *   - `.hbs`: parse front matter in handlebars templates
 */

Template.prototype.defaultRoutes = function() {
  if (this.enabled('default routes')) {
    var re = utils.extensionRe(Object.keys(this.engines));
    this.onLoad(re, require('./lib/middleware/matter'));
  }
};

/**
 * Load default engines. The default engine, [engine-lodash]
 * will process templates in any files with the `.md` extension.
 * To change or negate these extensions, just do:
 *
 * ```js
 * engine.option('defaultExts', 'md');
 * // or an array of extensions
 * engine.option('defaultExts', ['hbs', 'md']);
 * ```
 * @name default engines
 * @api public
 */

Template.prototype.defaultEngines = function() {
  if (this.enabled('default engines')) {
    this.engine(['*', 'md'], require('engine-lodash'), {
      layoutDelims: this.option('layoutDelims'),
      destExt: this.option('destExt')
    });
  }
};

/**
 * Register default template delimiters.
 *
 *   - engine delimiters: Delimiters used in templates process
 *     by [engine-lodash], the default engine.
 *   - layout delimiters: Delimiters used in layouts.
 *
 * @api private
 */

Template.prototype.defaultDelimiters = function() {
  this.addDelims('*', ['<%', '%>'], ['{%', '%}']);
};

/**
 * Register default view collections.
 */

Template.prototype.defaultTemplates = function() {
  this.create('page', { isRenderable: true });
  this.create('layout', { isLayout: true });
  this.create('partial', { isPartial: true });
};

/**
 * Assign transform `fn` to `name` or return the value of `name`
 * if no other arguments are passed.
 *
 * Transforms are run immediately during init, and are used to
 * extend or modify the `cache.data` object, but really anything
 * on the `this` object can be tranformed.
 *
 * ```js
 * template.transform('username', function(app) {
 *   var url = app.cache.data.author.url.split('/');
 *   app.cache.data.username = url[2];
 * });
 * ```
 *
 * @param {String} `name` The name of the transform to add.
 * @param {Function} `fn` The actual transform function.
 * @return {Object} Returns `Template` for chaining.
 * @api public
 */

Template.prototype.transform = function(name, fn) {
  debug.engine('adding [transform]: %s', name);
  if (arguments.length === 0) {
    return this.transforms;
  }
  if (arguments.length === 1) {
    return this.transforms[name];
  }

  this.transforms[name] = fn;
  if (fn && typeof fn === 'function') {
    fn.apply(this, [this].concat(arguments));
  }
  return this;
};

/**
 * Lazily initalize router, to allow options to
 * be passed in after init.
 */

Template.prototype.lazyrouter = function() {
  if (!this.router) {
    this.router = new Router({
      caseSensitive: this.enabled('case sensitive routing'),
      strict: this.enabled('strict routing'),
      methods: utils.methods.concat(this.option('router methods'))
    });
    // initialization middleware. currently a noop
    this.router.use(init(this));
  }
};

/**
 * Dispatch `file` through its middleware stack
 *
 * @param {String} `method` method to dispatch files to (undefined will dispatch to `all`)
 * @param  {Object} `file` File object to be passed through the middleware stack
 * @api private
 */

Template.prototype.handle = function(method, file, done) {
  debug.routes('handling: %j', arguments);
  if (typeof method === 'object') {
    done = file; file = method; method = null;
  }
  file.options = file.options || {};
  file.options.method = method;

  if (!this.router) {
    debug.routes('no routes defined on engine');
    done();
    return;
  }
  this.router.handle(file, done);
};

/**
 * Dispatch `file` through an explicitly defined middleware `stack`.
 *
 * @param  {Object} `file`
 * @param  {Array} `fns`
 * @api private
 */

Template.prototype.dispatch = function(file, fns) {
  forOwn(file, function (value, key) {
    if (fns) this.route(value.path).all(fns);
    this.handle('onLoad', value, function (err) {
      if (err) {
        console.error(chalk.red('Error running middleware for', key));
        console.error(chalk.red(err));
      }
    });
  }.bind(this));
};

/**
 * Proxy to the engine `Router#route()`
 * Returns a new `Route` instance for the `path`.
 *
 * Routes are isolated middleware stacks for specific paths.
 * See the Route api docs for details.
 *
 * @param {String} `path`
 * @api public
 */

Template.prototype.route = function(path) {
  debug.routes('route: %s', path);
  this.lazyrouter();
  return this.router.route(path);
};

/**
 * Proxy to `Router#param()` with one added api feature. The `name` parameter
 * can be an array of names.
 *
 * See the Router#param() docs for more details.
 *
 * @param {String|Array} `name`
 * @param {Function} `fn`
 * @return {Object} `Template` for chaining
 * @api public
 */

Template.prototype.param = function(name, fn) {
  debug.routes('param: %s', name);
  this.lazyrouter();
  if (Array.isArray(name)) {
    name.forEach(function(key) {
      this.param(key, fn);
    }, this);
    return this;
  }
  this.router.param(name, fn);
  return this;
};

/**
 * Proxy to `Router#use()` to add middleware to the engine router.
 * See Router#use() documentation for details.
 *
 * If the `fn` parameter is an engine, then it will be
 * mounted at the `route` specified.
 *
 * ```js
 * template.use(/\.md$/, function (file, next) {
 *   // do stuff next();
 * });
 * ```
 *
 * @param {Function} `fn`
 */

Template.prototype.use = function (fn) {
  var offset = 0, path = '/';
  // default path to '/'
  if (typeof fn !== 'function') {
    var arg = fn;
    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }
    // first arg is the path
    if (typeof arg !== 'function') {
      offset = 1;
      path = fn;
    }
  }

  var fns = flatten(slice(arguments, offset));
  if (fns.length === 0) {
    throw new TypeError('Template#use() expects middleware functions');
  }
  this.lazyrouter();
  var router = this.router;

  fns.forEach(function (fn) {
    // non-Template instance
    if (!fn || !fn.handle || !fn.set) {
      return router.use(path, fn.bind(this));
    }
    debug.routes('use: %s', path);
    fn.mountpath = path;
    fn.parent = this;
  }, this);
  return this;
};

/**
 * Delegate `.METHOD(...)` calls to `router.METHOD(...)`
 *
 * @param {String} `path`
 * @param {Function} Callback
 * @return {Object} `Template` for chaining
 * @api public
 */

utils.methods.forEach(function(method) {
  Template.prototype[method] = function(path) {
    debug.routes('%s: %s', method, path);
    this.lazyrouter();

    var route = this.router.route(path);
    var args = slice(arguments, 1);

    route[method].apply(route, args);
    return this;
  };
});

/**
 * Special-cased "all" method, applying the given route `path`,
 * middleware, and callback.
 *
 * ```js
 * template.all(/\.md$/, function (file, next) {
 *   // do stuff next();
 * });
 * ```
 *
 * @param {String} `path`
 * @param {Function} Callback
 * @return {Object} `Template` for chaining
 * @api public
 */

Template.prototype.all = function(path) {
  debug.routes('all: %s', path);
  this.lazyrouter();
  var route = this.router.route(path);
  var args = slice(arguments, 1);
  route.all.apply(route, args);
  return this;
};

/**
 * If a layout is defined, apply it. Otherwise just return the content as-is.
 *
 * @param  {String} `ext` The layout settings to use.
 * @param  {Object} `template` Template object, with `content` to be wrapped with a layout.
 * @return  {String} Either the string wrapped with a layout, or the original string if no layout was found.
 * @api private
 */

Template.prototype.applyLayout = function(template, locals) {
  debug.layout('applying layout: %j', arguments);

  // If a layout has already been applied, return the content
  if (template.options.layoutApplied) {
    return template.content;
  }

  template.options.layoutApplied = true;
  if (template.options.isPartial) {
    locals.defaultLayout = false;
  }

  // Get the name of the (starting) layout to be used
  var layout = utils.getLayout(template, locals);

  // If `layoutExt` is defined on the options, append
  // it to the layout name before passing the name to [layouts]
  var ext = this.option('layoutExt');
  if (ext) {
    layout = layout + utils.formatExt(ext);
  }

  // Merge `layout` collections based on settings
  var stack = this.mergeLayouts(locals);
  return layouts(template.content, layout, stack, locals);
};

/**
 * Pass custom delimiters to Lo-Dash.
 *
 * **Example:**
 *
 * ```js
 * template.makeDelims(['{%', '%}'], ['{{', '}}'], opts);
 * ```
 *
 * @param  {Array} `arr` Array of delimiters.
 * @param  {Array} `layoutDelims` layout-specific delimiters to use. Default is `['{{', '}}']`.
 * @param  {Object} `options` Options to pass to [delims].
 * @api private
 */

Template.prototype.makeDelims = function(arr, options) {
  var settings = extend({}, options, { escape: true });
  return this._.delims.makeDelims(arr, settings);
};

/**
 * Cache delimiters by `name` with the given `options` for later use.
 *
 * **Example:**
 *
 * ```js
 * template.addDelims('curly', ['{%', '%}']);
 * template.addDelims('angle', ['<%', '%>']);
 * template.addDelims('es6', ['${', '}'], {
 *   // override the generated regex
 *   interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
 * });
 * ```
 *
 * @param {String} `name` The name to use for the stored delimiters.
 * @param {Array} `delims` Array of delimiter strings. See [delims] for details.
 * @param {Object} `opts` Options to pass to [delims]. You can also use the options to
 *                        override any of the generated delimiters.
 * @api public
 */

Template.prototype.addDelims = function(ext, delims, layoutDelims, settings) {
  debug.delims('adding delims [ext]: %s', ext, delims);
  ext = utils.formatExt(ext);

  if (typeOf(layoutDelims) === 'object') {
    settings = layoutDelims;
    layoutDelims = null;
  }

  this._.delims.setDelims(ext, delims, settings);
  this.delims[ext] = this._.delims.getDelims(ext);

  if (Array.isArray(layoutDelims)) {
    this.delims[ext].layoutDelims = this.makeDelims(layoutDelims, settings);
  }
  return this;
};

/**
 * The `ext` of the stored delimiters to pass to the current delimiters engine.
 * The engine must support custom delimiters for this to work.
 *
 * @param  {Array} `ext` The name of the stored delimiters to pass.
 * @api private
 */

Template.prototype.getDelims = function(ext) {
  debug.delims('getting delims: %s', ext);

  ext = ext || this.currentDelims || this.option('ext');
  ext = utils.formatExt(ext);

  if(utils.hasOwn(this.delims, ext)) {
    return this.delims[ext];
  }

  this.useDelims(ext);
  return this.delims[ext];
};

/**
 * Specify by `ext` the delimiters to make active.
 *
 * ```js
 * template.useDelims('curly');
 * template.useDelims('angle');
 * ```
 *
 * @param {String} `ext`
 * @api public
 */

Template.prototype.useDelims = function(ext) {
  debug.delims('using delims: %s', ext);
  ext = utils.formatExt(ext);

  Object.defineProperty(this, 'currentDelims', {
    configurable: true,
    get: function () {
      return ext;
    },
    set: function (val) {
      ext = val;
    }
  });
  return ext;
};

/**
 * Specify by `ext` the delimiters to make active.
 *
 * ```js
 * template.useDelims('curly');
 * template.useDelims('angle');
 * ```
 *
 * @param {String} `ext`
 * @api public
 */

Template.prototype.handleDelims = function(ext, engine, template, locals) {
  // See if delimiters are defined for the template
  var delims = template.delims
    || template.options.delims
    || locals.delims
    || engine.options && engine.options.delims;

  // See if escape syntax is defined for delimiters
  var escapeDelims = template.escapeDelims
    || template.options.escapeDelims
    || locals.escapeDelims
    || engine.options && engine.options.escapeDelims
    || this.option('escapeDelims');

  if (escapeDelims && typeof escapeDelims === 'object') {
    if (Array.isArray(escapeDelims)) {
      escapeDelims = {from: escapeDelims, to: delims};
    }
    locals.escapeDelims = escapeDelims;
  }

  // Ensure that delimiters are converted to regex and
  // cached, so we can pass the regex to the engine
  if (Array.isArray(delims) && typeof this.currentDelims === 'undefined') {
    this.addDelims(ext, delims);
  }
};

/**
 * Private method for registering an engine. Register the given view
 * engine callback `fn` as `ext`.
 *
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Object} `Template` to enable chaining
 * @api private
 */

Template.prototype.registerEngine = function(ext, fn, options) {
  debug.engine('registering [engine]: %s', ext);

  var opts = extend({}, options);
  ext = utils.formatExt(ext);

  this._.engines.setEngine(ext, fn, opts);
  if (opts.delims) {
    this.addDelims(ext, opts.delims);
    this.engines[ext].delims = this.getDelims(ext);
  }
  return this;
};

/**
 * Register the given view engine callback `fn` as `ext`. If only `ext`
 * is passed, the engine registered for `ext` is returned. If no `ext`
 * is passed, the entire cache is returned.
 *
 * @doc api-engine
 * @param {String|Array} `exts` File extension or array of extensions.
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Object} `Template` to enable chaining
 * @api public
 */

Template.prototype.engine = function(exts, fn, options) {
  debug.engine('engine %j:', exts);
  arrayify(exts).forEach(function(ext) {
    this.registerEngine(ext, fn, options);
  }.bind(this));
  return this;
};

/**
 * Get the engine settings registered for the given `ext`.
 *
 * ```js
 * template.getEngine('.html');
 * ```
 *
 * @doc api-getEngine
 * @param {String} `ext` The engine to get.
 * @return {Object} Object with methods and settings for the specified engine.
 * @api public
 */

Template.prototype.getEngine = function(ext) {
  debug.engine('getting [engine]: %s', ext);
  return this._.engines.getEngine(ext);
};

/**
 * Used in the `.render()` method to select the `ext`
 * to use for picking an engine.
 *
 * This logic can be overridden by passing a custom
 * function on `options.getExt`, e.g.:
 *
 * **Example:**
 *
 * ```js
 * template.option('getExt', function(template, locals) {
 *   return path.extname(template.path);
 * });
 * ```
 *
 * @param {Object} `template` Template object
 * @param {Object} `locals` Locals object
 * @return {String} `ext` For determining the engine to use.
 * @api public
 */

Template.prototype.getExt = function(template, locals) {
  var fn = this.option('getExt');

  if (typeof fn === 'function') {
    return fn.call(this, template, locals);
  }

  template.locals = template.locals || {};

  // `_engine` is defined on the `.create()` method
  var ext = template.options._engine
    || template.locals.engine
    || template.options.engine
    || locals.engine
    || locals.ext
    || template.engine
    || template.ext
    || path.extname(template.path)
    || this.option('viewEngine');

  if (ext == null) return null;
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }
  return ext;
};

/**
 * Assign mixin `fn` to `name` or return the value of `name`
 * if no other arguments are passed.
 *
 * This method sets mixins on the cache, which can later be passed
 * to any template engine that uses mixins, like Lo-Dash or Underscore.
 * This also ensures that mixins are passed to the same instance of
 * whatever engine is used.
 *
 * @param {String} `name` The name of the mixin to add.
 * @param {Function} `fn` The actual mixin function.
 * @api private
 */

Template.prototype.mixin = function(name, fn) {
  debug.engine('adding [mixin]: %s', name);
  if (arguments.length === 0) {
    return this._.mixins;
  }
  if (arguments.length === 1) {
    return this._.mixins[name];
  }
  this._.mixins[name] = fn;
  return this;
};

/**
 * Assign import `fn` to `name` or return the value of `name`
 * if no other arguments are passed.
 *
 * ```js
 * template.imports('log', function(msg) {
 *   return console.log(msg);
 * });
 * ```
 * @param {String} `name` The name of the import to add.
 * @param {Function} `fn` The actual import function.
 * @api private
 */

Template.prototype.imports = function(name, fn) {
  debug.engine('adding [imports]: %s', name);
  if (arguments.length === 0) {
    return this._.imports;
  }
  if (arguments.length === 1) {
    return this._.imports[name];
  }
  this._.imports[name] = fn;
  return this;
};

/**
 * Register generic template helpers that are not specific to an
 * engine.
 *
 * Helpers registered using this method will be passed to every
 * engine, so this method is best for generic javascript functions -
 * unless you want to see Lo-Dash blow up from `Handlebars.SafeString`.
 *
 * ```js
 * template.helper('lower', function(str) {
 *   return str.toLowerCase();
 * });
 * ```
 *
 * @param {String} `key` Helper name
 * @param {Function} `fn` Helper function.
 * @api public
 */

Template.prototype.helper = function(name, fn) {
  debug.helper('adding helper: %s', name);
  this._.helpers.addHelper(name, fn);
  return this;
};

/**
 * Register multiple helpers.
 *
 * ```js
 * template.addHelpers({
 *   a: function() {},
 *   b: function() {},
 *   c: function() {},
 * });
 * ```
 *
 * @param {Object|Array} `helpers` Object, array of objects, or glob patterns.
 * @api public
 */

Template.prototype.helpers = function(helpers, options) {
  debug.helper('adding helpers: %s', helpers);
  options = options || {};
  options.matchLoader = function () {
    return 'helpers';
  };
  this._.helpers.addHelpers(this.load(helpers, options));
  return this;
};

/**
 * Register generic async template helpers that are not specific to an
 * engine.
 *
 * As with the sync version, helpers registered using this method will
 * be passed to every engine, so this method is best for generic
 * javascript functions.
 *
 * ```js
 * template.asyncHelper('lower', function(str, next) {
 *   str = str.toLowerCase();
 *   next();
 * });
 * ```
 *
 * @param {String} `name` Helper name.
 * @param {Function} `fn` Helper function
 * @api public
 */

Template.prototype.asyncHelper = function(name, fn) {
  debug.helper('adding async helper: %s', name);
  this._.asyncHelpers.addAsyncHelper(name, fn);
  return this;
};

/**
 * Register multiple async helpers.
 *
 * ```js
 * template.addAsyncHelpers({
 *   a: function() {},
 *   b: function() {},
 *   c: function() {},
 * });
 * ```
 *
 * @param {Object|Array} `helpers` Object, array of objects, or glob patterns.
 * @api public
 */

Template.prototype.asyncHelpers = function(helpers, options) {
  debug.helper('adding async helpers: %s', helpers);
  options = options || {};
  options.matchLoader = function () {
    return 'helpers';
  };
  this._.asyncHelpers.addAsyncHelpers(this.load(helpers, options));
  return this;
};

/**
 * Register an object of helpers for the given `ext` (engine).
 *
 * ```js
 * template.helpers(require('handlebars-helpers'));
 * ```
 *
 * @param {String} `ext` The engine to register helpers with.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.engineHelpers = function(ext) {
  debug.helper('helpers for engine: %s', ext);
  return this.getEngine(ext).helpers;
};

/**
 * Create helpers for each default template `type`.
 *
 * @param {String} `type` The type of template.
 * @param {String} `plural` Plural form of `type`.
 * @api private
 */

Template.prototype.defaultHelper = function(subtype, plural) {
  debug.helper('default helper: %s', subtype);
  var self = this;
  this.helper(subtype, function (key, locals) {
    debug.helper('helper: [%s / %s]', subtype, key);
    var partial = self.views[plural][key];

    if (!partial) {
      // TODO: use actual delimiters in messages
      debug.err(chalk.red('helper {{' + subtype + ' "' + key + '"}} not found.'));
      return '';
    }
    var locs = extend({}, this.context, locals);
    var content = self.renderTemplate(partial, locs);
    if (content instanceof Error) {
      throw content;
    }
    return content;
  });
};

/**
 * Create async helpers for each default template `type`.
 *
 * @param {String} `type` The type of template.
 * @param {String} `plural` Plural form of `type`.
 * @api private
 */

Template.prototype.defaultAsyncHelper = function(subtype, plural) {
  debug.helper('default async helper: %s', subtype);
  var self = this;

  this.asyncHelper(subtype, function (key, locals, next) {
    debug.helper('async helper: [%s / %s]', subtype, key);

    var last = arguments[arguments.length - 1];
    if (typeof locals === 'function') {
      next = locals;
      locals = {};
    }

    if (typeof next !== 'function') {
      next = last;
    }

    var partial = self.views[plural][key];

    if (!partial) {
      // TODO: use actual delimiters in messages
      debug.err(chalk.red('helper {{' + subtype + ' "' + key + '"}} not found.'));
      return next(null, '');
    }

    var locs = extend({}, this.context, locals);
    var render = self.renderSubtype(subtype);

    render(key, locs, function (err, content) {
      if (err) return next(err);
      next(null, content);
      return;
    });
  });
};

/**
 * Create a load method for the specified template type.
 * The load method runs the loader stack for the specified template type then
 * normalizes and validates the results and adds them to the template cache.
 *
 * @param  {String} `subtype` Template type to use
 * @param  {String} `plural`  Plural name of the template type to use
 * @param  {Object} `options` Additional options to pass to normalize
 * @return {Function} Method for loading templates of the specified type
 * @api private
 */

Template.prototype._load = function(subtype, plural, options) {
  var opts = extend({}, options);
  var type = opts.load || 'sync';

  return function (/*args, stack, options*/) {
    var self = this;
    var args = slice(arguments);
    var stack = [];
    var len = args.length;

    // Default method used to handle sync loading when done
    var cb = function (err, template) {
      if (err) throw new Error(err);
      return template;
    };

    // Normalize args to pass to loader stack
    args = args.filter(function (arg, i) {
      if (i !== 0 && typeOf(arg) === 'array') {
        stack = arg;
      } else if (i === len - 1 && typeOf(arg) === 'function') {
        if (type !== 'async') {
          throw new Error(subtype + ' loaders are not async.');
        }
        cb = arg;
      } else {
        return arg;
      }
    });

    if (args.length === 1) args = args[0];
    var loadOpts = {
      matchLoader: function () {
        return subtype;
      }
    };

    /**
     * Default done function for normalization, validation,
     * and extending the views when finished loading
     */
    function done(err, template) {
      if (err) return cb(err);
      template = self.normalize(plural, template, options);
      // validate the template object before moving on
      self.validate(template);
      // Run middleware
      self.dispatch(template);
      // Add template to the cache
      extend(self.views[plural], template);
      return cb(null, template);
    }

    // Choose loaders based on loader type
    switch (type) {
      case 'async':
        self.loadAsync(args, stack, loadOpts, done);
        break;
      case 'promise':
        return self.loadPromise(args, stack, loadOpts)
          .then(function (template) {
            return done(null, template);
          });
      case 'stream':
        return self.loadStream(args, stack, loadOpts)
          .on('data', function (template) {
            done(null, template);
          })
          .on('error', done);
      default:
        return done(null, self.load(args, stack, loadOpts));
    }
  };
};

/**
 * Validate a template object to ensure that it has the properties
 * expected for applying layouts, choosing engines, and so on.
 *
 * @param  {String} `key` Template key
 * @param  {Object} `value` Template object
 * @api public
 */

Template.prototype.validate = function(template) {
  if (template == null || typeOf(template) !== 'object') {
    debug.err('`template` must be an object.');
  }

  forOwn(template, function (value, key) {
    if (key == null || typeof key !== 'string') {
      debug.err('template `key` must be a string.');
    }

    if (value == null || typeOf(value) !== 'object') {
      debug.err('template `value` must be an object.');
    }

    if (!utils.hasOwn(value, 'path')) {
      debug.err('template `value` must have a `path` property.');
    }

    if (!utils.hasOwn(value, 'content')) {
      debug.err('template `value` must have a `content` property.');
    }
  });
};

/**
 * Normalize a template object to ensure it has the necessary
 * properties to be rendered by the current renderer.
 *
 * @param  {Object} `template` The template object to normalize.
 * @param  {Object} `options` Options to pass to the renderer.
 *     @option {Function} `renameKey` Override the default function for renaming
 *             the key of normalized template objects.
 * @return {Object} Normalized template.
 * @api private
 */

Template.prototype.normalize = function(plural, template, options) {
  debug.template('normalizing: [%s]: %j', plural, template);
  this.lazyrouter();

  if (this.option('normalize')) {
    return this.options.normalize.apply(this, arguments);
  }

  var opts = extend({}, options);
  var self = this;

  forOwn(template, function (value, key) {
    value.locals = value.locals || {};
    value.options = extend({ subtype: plural }, options, value.options);
    value.layout = value.layout || value.locals.layout;

    // Add a render method to the template
    // TODO: allow additional opts to be passed
    // this engine logic is temporary until we decide
    // how we want to allow users to control this.
    // for now, this allows the user to change the engine
    // preference in the the `getExt()` method.
    if (utils.hasOwn(opts, 'engine')) {
      var ext = opts.engine;
      if (ext[0] !== '.') {
        ext = '.' + ext;
      }
      value.options._engine = ext;
    }
    if (utils.hasOwn(opts, 'delims')) {
      value.options.delims = opts.delims;
    }

    value.render = function (locals, cb) {
      return self.renderTemplate(this, locals, cb);
    };

    template[key] = value;
  }, this);
  return template;
};

/**
 * Get the given view `collection` from views. Optionally
 * pass a `name` to get a specific template from the
 * collection.
 *
 * @param {String} `collection`
 * @param {String} `name`
 * @return {Object}
 * @api public
 */

Template.prototype.view = function(collection, name) {
  if (utils.hasOwn(this.views, collection)) {
    var obj = this.views[collection];
    return name ? obj[name] : obj;
  }
  return null;
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
  var opts = extend({}, options);

  // Make an association between `subtype` and its `plural`
  this.collection[subtype] = plural;

  if (opts.isRenderable) {
    this.type.renderable.push(plural);
  }

  if (opts.isLayout) {
    this.type.layout.push(plural);
  }

  if (opts.isPartial || (!opts.isRenderable && !opts.isLayout)) {
    this.type.partial.push(plural);
    opts.isPartial = true;
  }
  return opts;
};

/**
 * Private method for registering a loader stack for a specified
 * template type.
 *
 * @param {String} `subtype` template type to set loader stack for
 * @param {Object} `options` additional options to determine the loader type
 * @param {Array}  `stack` loader stack
 */

Template.prototype.setLoaders = function(subtype, options, stack) {
  options = options || {};
  var type = options.load || 'sync';

  if (this._.loaders.cache[type] && this._.loaders.cache[type][subtype]) {
    delete this._.loaders.cache[type][subtype];
  }
  if (stack.length === 0) {
    stack.push(['default']);
  }

  var loader = 'loader';
  if (type !== 'sync') {
    loader = utils.methodName('loader', type);
  }
  this[loader].apply(this, [].concat([subtype], stack));
};

/**
 * Get all views of the given [type]. Valid values are
 * `renderable`, `layout` or `partial`.
 *
 * ```js
 * var pages = template.getType('renderable');
 * //=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
 * ```
 *
 * [type]: ./template-types
 *
 * @param {String} `type`
 * @param {Object} `opts`
 * @api public
 */

Template.prototype.getType = function(type) {
  debug.template('getting type: %s', type);
  var arr = this.type[type];

  return arr.reduce(function(acc, plural) {
    acc[plural] = this.views[plural];
    return acc;
  }.bind(this), {});
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
 * @param {String} `collections` Optionally pass an array of collections
 * @api public
 */

Template.prototype.mergeType = function(type, collections) {
  debug.template('merging [type]: %s', type);
  var obj = this.getType(type);

  collections = arrayify(collections || Object.keys(obj));
  var len = collections.length;
  var o = {};
  var i = len - 1;

  while (len--) {
    var colection = collections[i--];
    for (var key in this.views[colection]) {
      if (utils.hasOwn(this.views[colection], key)) {
        o[key] = this.views[colection][key];
      }
    }
  }
  return o;
};

/**
 * Merge all `layout` collections based on user-defined options.
 *
 * ```js
 *
 *
 * @param {String} `type` The template type to search.
 * @param {String} `collections` Optionally pass an array of collections
 * @api public
 */

Template.prototype.mergeLayouts = function(options) {
  debug.template('merging layouts: %j', options);

  var layouts = {};
  var mergeLayouts = this.option('mergeLayouts');

  if (typeof mergeLayouts === 'function') {
    return mergeLayouts.call(this, arguments);
  }

  if (Array.isArray(mergeLayouts)) {
    layouts = this.mergeType('layout', mergeLayouts);
  } else if (mergeLayouts === false) {
    layouts = this.views.layouts;
  } else {
    layouts = this.mergeType('layout');
  }
  var mergeTypeContext = this.mergeTypeContext.bind(this, 'layouts');
  forOwn(layouts, function (value, key) {
    mergeTypeContext(key, value.locals, value.data);
  });
  return layouts;
};

/**
 * Default method for determining how partials are to be passed to
 * engines. By default, all `partial` collections are merged onto a
 * single `partials` object. To keep each collection on a separate
 * object, you can do `template.disable('mergePartials')`.
 *
 * If you want to control how partials are merged, you can also
 * pass a function to the `mergePartials` option:
 *
 * ```js
 * template.option('mergePartials', function(locals) {
 *   // do stuff
 * });
 * ```
 *
 * @param  {Object} `locals` Locals should have layout delimiters, if defined
 * @return {Object}
 * @api public
 */

Template.prototype.mergePartials = function(context) {
  debug.template('merging partials [%s]: %j', arguments);
  // locals = merge({}, context, locals);

  var mergePartials = this.option('mergePartials');
  if (typeof mergePartials === 'function') {
    return mergePartials.call(this, context);
  }

  var opts = context.options || {};
  opts.partials = cloneDeep(context.partials || {});

  // loop over each `partial` collection (e.g. `docs`)
  this.type.partial.forEach(function (plural) {

    // Example `this.views.docs`
    var collection = this.views[plural];
    var mergeTypeContext = this.mergeTypeContext.bind(this, 'partials');

    // Loop over each partial in the collection
    forOwn(collection, function (value, key/*, template*/) {
      mergeTypeContext(key, value.locals, value.data);

      // get the globally stored context that we just created
      // using `mergeTypeContext` for the current partial
      var layoutOpts = this.cache._context.partials[key];
      layoutOpts.layoutDelims = pickFrom('layoutDelims', [layoutOpts, opts]);

      // wrap the partial with a layout, if applicable
      value.content = this.applyLayout(value, layoutOpts);

      // If `mergePartials` is true combine all `partial` subtypes
      if (mergePartials === true) {
        opts.partials[key] = value.content;

      // Otherwise, each partial subtype on a separate object
      } else {
        opts[plural] = opts[plural] || {};
        opts[plural][key] = value.content;
      }
    }, this);
  }, this);

  context.options = extend({}, context.options, opts);
  return context;
};

/**
 * Search all `subtype` objects of the given `type`, returning
 * the first template found with the given `key`. Optionally pass
 * an array of `subtypes` to limit the search;
 *
 * @param {String} `type` The template type to search.
 * @param {String} `key` The template to find.
 * @param {Array} `subtypes`
 * @api private
 */

Template.prototype.find = function(type, key, subtypes) {
  var o = this.mergeType(type, subtypes);
  if (o && typeOf(o) === 'object' && utils.hasOwn(o, key)) {
    return o[key];
  }
  if (this.enabled('strict errors')) {
    throw new Error('Cannot find ' + type + ' template: "' + key + '"');
  }
};

/**
 * Search all renderable `subtypes`, returning the first template
 * with the given `key`.
 *
 *   - If `key` is not found an error is thrown.
 *   - Optionally limit the search to the specified `subtypes`.
 *
 * @param {String} `key` The template to search for.
 * @param {Array} `subtypes`
 * @api public
 */

Template.prototype.findRenderable = function(key, subtypes) {
  return this.find('renderable', key, subtypes);
};

/**
 * Search all layout `subtypes`, returning the first template
 * with the given `key`.
 *
 *   - If `key` is not found an error is thrown.
 *   - Optionally limit the search to the specified `subtypes`.
 *
 * @param {String} `key` The template to search for.
 * @param {Array} `subtypes`
 * @api public
 */

Template.prototype.findLayout = function(key, subtypes) {
  return this.find('layout', key, subtypes);
};

/**
 * Search all partial `subtypes`, returning the first template
 * with the given `key`.
 *
 *   - If `key` is not found an error is thrown.
 *   - Optionally limit the search to the specified `subtypes`.
 *
 * @param {String} `key` The template to search for.
 * @param {Array} `subtypes`
 * @api public
 */

Template.prototype.findPartial = function(key, subtypes) {
  return this.find('partial', key, subtypes);
};

/**
 * Convenience method for finding a template by `name` on
 * the given collection. Optionally specify a file extension.
 *
 * @param {String} `plural` The view collection to search.
 * @param {String} `name` The name of the template.
 * @param {String} `ext` Optionally pass a file extension to append to `name`
 * @api public
 */

Template.prototype.lookup = function(plural, name, ext) {
  var views = this.views[plural];
  if (utils.hasOwn(views, name)) {
    return views[name];
  }
  if (utils.hasOwn(views, name + (ext || '.md'))) {
    return views[name + (ext || '.md')];
  }
  if (this.enabled('strict errors')) {
    throw new Error('Cannot find ' + plural + ': "' + name + '"');
  }
  debug.err('Cannot find ' + plural + ': "' + name + '"');
  return null;
};

/**
 * Create a new `view` collection and associated convience methods.
 *
 * Note that when you only specify a name for the type, a plural form is created
 * automatically (e.g. `page` and `pages`). However, you can define the
 * `plural` form explicitly if necessary.
 *
 * @param {String} `subtype` Singular name of the collection to create, e.g. `page`.
 * @param {String} `plural` Plural name of the collection, e.g. `pages`.
 * @param {Object} `options` Options for the collection.
 *   @option {Boolean} [options] `isRenderable` Templates that may be rendered at some point
 *   @option {Boolean} [options] `isLayout` Templates to be used as layouts
 *   @option {Boolean} [options] `isPartial` Templates to be used as partial views or includes
 * @param {Function|Array} `stack` Loader function or functions to be run for every template of this type.
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.create = function(subtype, plural, opts/*, stack*/) {
  debug.template('creating subtype: %s', subtype);
  var args = slice(arguments);

  // normalize arguments
  if (typeOf(plural) !== 'string') { args.splice(1, 0, subtype + 's'); }
  if (typeOf(args[2]) !== 'object') { args.splice(2, 0, {}); }
  plural = args[1];
  opts = args[2];

  // add an object to `views` for this template type
  this.views[plural] = this.views[plural] || {};
  opts = this.setType(subtype, plural, opts);

  // add loaders to default loaders
  this.setLoaders(subtype, opts, slice(args, 3));

  // Add convenience methods for this sub-type
  this.decorate(subtype, plural, opts);

  // create default helpers
  if (this.enabled('default helpers') && opts && opts.isPartial) {
    // Create a sync helper for this type
    if (!utils.hasOwn(this._.helpers, subtype)) {
      this.defaultHelper(subtype, plural);
    }
    // Create an async helper for this type
    if (!utils.hasOwn(this._.asyncHelpers, subtype)) {
      this.defaultAsyncHelper(subtype, plural);
    }
  }
  return this;
};

/**
 * Decorate a new template subtype with convenience methods.
 * For example, the `post` template type would have `.post()`
 * and `.posts()` methods created.
 */

Template.prototype.decorate = function(subtype, plural, options) {
  debug.template('decorating subtype: [%s / %s]', subtype, plural);

  // plural convenience method, ex: `.pages`
  mixin(plural, this._load(subtype, plural, options));

  // singular convenience method, ex: `.page`
  mixin(subtype, function (/*template*/) {
    return this[plural].apply(this, arguments);
  });

  // Add a `get` method to `Template` for `subtype`
  mixin(utils.methodName('get', subtype), function (key) {
    return this.views[plural][key];
  });

  // Add a `render` method to `Template` for `subtype`
  mixin(utils.methodName('render', subtype), function () {
    return this.renderSubtype(subtype);
  });
};

/**
 * Base compile method. Use `engine` to compile `content` with the
 * given `options`
 *
 * @param  {Object} `engine` Engine object, with `.compile()` method
 * @param  {Object} `content` The content string to compile.
 * @param  {Object} `options` options to pass to registered view engines.
 * @return {Function} The compiled template string.
 * @api private
 */

Template.prototype.compileBase = function(engine, content, options) {
  debug.render('compileBase: %j', arguments);
  if (!utils.hasOwn(engine, 'compile')) {
    throw new Error('`.compile()` method not found on: "' + engine.name + '".');
  }
  try {
    return engine.compile(content, options);
  } catch (err) {
    debug.err('compile: %j', err);
    return err;
  }
};

/**
 * Compile content on the given `template` object with the specified
 * engine `options`.
 *
 * @param  {Object} `template` The template object with content to compile.
 * @param  {Object} `options` Options to pass along to the engine when compile. May include a `context` property to bind to helpers.
 * @return {Object} Template object to enable chaining.
 * @api public
 */

Template.prototype.compileTemplate = function(template, options, async) {
  debug.render('compileTemplate: %j', template);

  if (typeOf(template) !== 'object') {
    throw new Error('Template#compileTemplate() expects an object, got: "'
      + typeOf(template) + ' / '+ template + '".');
  }

  // reference to options in case helpers are needed later
  var opts = options || {};
  var context = opts.context || {};
  delete opts.context;

  template.options = template.options || {};
  template.options.layout = template.layout;

  // find ext and engine to use
  var ext = template.ext || this.getExt(template, context);
  var engine = this.getEngine(ext);

  // Handle custom template delimiters and escaping
  this.handleDelims(ext, engine, template, opts);

  // additional delim settings
  var settings;

  if (typeof this.currentDelims !== 'undefined') {
    settings = this.delims[this.currentDelims];
  } else {
    settings = this.getDelims(ext);
  }

  if (settings) {
    opts = extend({}, settings, opts);
  }

  // Bind context to helpers before passing to the engine.
  this.bindHelpers(opts, context, async);
  opts.debugEngine = this.option('debugEngine');

  // if a layout is defined, apply it before compiling
  var content = this.applyLayout(template, extend({}, context, opts));

  // compile template
  return this.compileBase(engine, content, opts);
};

/**
 * Compile `content` with the given `options`.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `options`
 * @param  {Boolean} `async` Load async helpers
 * @return {Function} Compiled function.
 * @api public
 */

Template.prototype.compile = function(content, options, async) {
  debug.render('compile: %j', arguments);

  if (content == null) {
    throw new Error('Template#compile() expects a string or object.');
  }

  if (typeOf(content) === 'object') {
    return this.compileTemplate(content, options, async);
  }

  var template = this.findRenderable(content);
  if (typeOf(template) === 'object') {
    return this.compileTemplate(template, options, async);
  }

  return this.compileString(content, options, async);
};

/**
 * Compile the given string with the specified `options`.
 *
 * The primary purpose of this method is to get the engine before
 * passing args to `.compileBase()`.
 *
 * @param  {String} `str` The string to compile.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @param  {Boolean} `async` Load async helpers
 * @return {Function}
 * @api public
 */

Template.prototype.compileString = function(str, options, async) {
  debug.render('render string: %s', str);
  if (typeof options === 'boolean') {
    async = options;
    options = {};
  }

  options = extend({locals: {}}, options);
  var locals = options.locals;

  var template = { content: str, locals: locals, options: options };
  return this.compileTemplate(template, options, async);
};

/**
 * Base render method. Use `engine` to render `content` with the
 * given `options` and `callback`.
 *
 * @param  {Object} `engine` Engine object, with `.render()` and/or `.renderSync()` method(s)
 * @param  {Object} `content` The content string to render.
 * @param  {Object} `options` Locals and/or options to pass to registered view engines.
 * @param  {Function} `cb` If a callback is passed, `.render()` is used, otherwise `.renderSync()` is used.
 * @return {String} The rendered template string.
 * @api private
 */

Template.prototype.renderBase = function(engine, content, options, cb) {
  debug.render('renderBase: %j', arguments);
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    return this.renderSync(engine, content, options);
  }

  return this.renderAsync(engine, content, options, cb);
};

/**
 * Render content on the given `template` object with the specified
 * engine `options` and `callback`.
 *
 * @param  {Object} `template` The template object with content to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderTemplate = function(template, locals, cb) {
  var self = this;
  debug.render('renderTemplate: %j', template);
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  if (typeOf(template) !== 'object') {
    throw new Error('Template#renderTemplate() expects an object, got: "'
      + typeOf(template) + ' / '+ template + '".');
  }

  // find any options passed in on locals
  locals = locals || {};
  var opts = extend({}, locals.options);

  // handle pre-render middleware routes
  this.handle('preRender', template, handleError(template, 'preRender'));

  // Merge `.render()` locals with template locals
  locals = this.mergeContext(template, locals);

  // merge options
  extend(opts, locals.options);

  // find the engine to use to render
  var ext = this.getExt(template, opts);
  var engine = this.getEngine(ext);

  // compile the template if it hasn't been already
  if (typeOf(template.fn) !== 'function') {
    opts.context = opts.context || locals;
    var objects = [opts, opts.context, engine.options, this.options];

    opts.delims = pickFrom('delims', objects);
    opts.layoutDelims = pickFrom('layoutDelims', objects);

    var isAsync = typeOf(cb) === 'function';
    template.fn = this.compileTemplate(template, opts, isAsync);
  }

  var content = template.fn;

  // backwards compatibility for engines that don't support compile
  if (typeof content === 'string') {
    extend(locals, opts);
  }

  /**
   * sync
   */

  // when a callback is not passed, render and handle middleware
  if (typeof cb !== 'function') {
    template.content = this.renderBase(engine, content, locals, cb);

    // handle post-render middleware routes
    this.handle('postRender', template, handleError(template, 'postRender'));
    return template.content;
  }

  /**
   * async
   */

  // when a callback is passed, render and handle middleware in callback
  return this.renderBase(engine, content, locals, function (err, content) {
    if (err) return cb.call(self, err);
    template.content = content;
    self.handle('postRender', template, handleError(template, 'postRender'));
    return cb.call(self, null, template.content);
  });
};

/**
 * Base sync render method. Uses the given `engine` to render
 * `content` with the given `options`.
 *
 * @param  {Object} `engine` Engine object must have a `.renderSync()` method.
 * @param  {Object} `content` The content string to render.
 * @param  {Object} `options` Locals and/or options to pass to registered view engines.
 * @return {String} The rendered template string.
 * @api private
 */

Template.prototype.renderSync = function(engine, content, options) {
  if (!utils.hasOwn(engine, 'renderSync')) {
    throw new Error('`.renderSync()` method not found on: "' + engine.name + '".');
  }
  try {
    return engine.renderSync(content, options);
  } catch (err) {
    debug.err('renderSync: %j', err);
    return err;
  }
};

/**
 * Base async render method. Uses the given `engine` to render
 * `content` with the given `options` and `callback`.
 *
 * @param  {Object} `engine` Engine object, with `.render()` and/or `.renderSync()` method(s)
 * @param  {Object} `content` The content string to render.
 * @param  {Object} `options` Locals and/or options to pass to registered view engines.
 * @param  {Function} `cb` If a callback is passed, `.render()` is used, otherwise `.renderSync()` is used.
 * @return {String} The rendered template string.
 * @api private
 */

Template.prototype.renderAsync = function(engine, content, options, cb) {
  if (!utils.hasOwn(engine, 'render')) {
    throw new Error('`.render()` method not found on: "' + engine.name + '".');
  }

  try {
    var self = this;
    engine.render(content, options, function (err, res) {
      if (err) {
        debug.render('renderAsync: %j', err);
        cb.call(self, err);
        return;
      }

      self._.asyncHelpers.resolveHelper(res, function (err, res) {
        if (err) {
          debug.err('renderAsync [helpers]: %j', err);
          return cb.call(self, err);
        }

        cb.call(self, null, res);
      });
    });
  } catch (err) {
    debug.err('renderAsync [catch]: %j', err);
    cb.call(self, err);
  }
};

/**
 * Render `content` with the given `options` and optional `callback`.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String} Rendered string.
 * @api public
 */

Template.prototype.render = function(content, locals, cb) {
  debug.render('render: %j', arguments);

  if (content == null) {
    throw new Error('Template#render() expects a string or object.');
  }

  if (typeOf(content) === 'object') {
    return this.renderTemplate(content, locals, cb);
  }

  var template = this.findRenderable(content);
  if (typeOf(template) === 'object') {
    return this.renderTemplate(template, locals, cb);
  }

  return this.renderString(content, locals, cb);
};

/**
 * Render the given string with the specified `locals` and `callback`.
 *
 * The primary purpose of this method is to get the engine before
 * passing args to `.renderBase()`.
 *
 * @param  {String} `str` The string to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderString = function(str, locals, cb) {
  debug.render('render string: %s', str);
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  locals = extend({options: {}}, locals);
  var options = locals.options || {};

  var template = { content: str, locals: locals, options: options };
  return this.renderTemplate(template, locals, cb);
};

/**
 * Returns a render function for rendering templates of the given `subtype`.
 *
 * Mostly used internally as a private method, but it's exposed as a
 * public method since there are cases when it might be useful, like
 * for rendering templates in a gulp/grunt/assemble plugin.
 *
 * @param  {String} `plural` Template subtype, e.g. `pages`
 * @return {Function} `params`
 *   @param  {String} [params] `str` The string to render.
 *   @param  {Object} [params] `locals` Locals and/or options to pass to registered view engines.
 *   @return {String} [params] `string` The rendered string.
 * @api public
 */

Template.prototype.renderSubtype = function(subtype) {
  debug.render('render subtype: [%s / %s]', subtype);

  // get the plural name of the given subtype
  var plural = this.collection[subtype];
  var self = this;

  return function (key, locals, cb) {
    debug.render('rendering subtype: %j', arguments);
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    // Return the first matching template from a `renderable` subtype
    var template = self.lookup(plural, key);
    if (template == null) {
      throw new Error('Template#renderSubtype() Cannot find template: "' + key + '".');
    }
    return self.renderTemplate(template, locals, cb);
  };
};

/**
 * Render the given string with the specified `locals` and `callback`.
 *
 * @param  {String} `str` The string to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderType = function(type, subtype) {
  debug.render('render type: [%s / %s]', type, subtype);
  var self = this;

  return function (key, locals, cb) {
    debug.render('rendering type: %j', arguments);
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var template = self.find(type, key, subtype);
    if (template == null) {
      throw new Error('Template#renderType() Cannot find template: "' + key + '".');
    }
    return self.renderTemplate(template, locals, cb);
  };
};

/**
 * Expose the current context as `this` in helpers.
 *
 *   - Exposes `locals` on the `context` property
 *   - Exposes `Template` on the `app` property
 *
 * @param  {Object} `options` Additional options that may contain helpers
 * @param  {Object} `context` Used as the context to bind to helpers
 * @param  {Boolean} `async` Is the helper async?
 * @return {Object}
 */

Template.prototype.bindHelpers = function (options, context, async) {
  debug.helper('binding helpers: %j %j', context, options);

  var helpers = {};
  extend(helpers, this.options.helpers);
  extend(helpers, this._.helpers);
  extend(helpers, this._.imports);

  if (async) {
    extend(helpers, this._.asyncHelpers);
  }
  extend(helpers, options.helpers);

  var o = {};
  o.options = extend({}, this.options, options);
  o.context = context || {};
  o.app = this;

  options.helpers = utils.bindAll(helpers, o);
};

/**
 * Build the context to be passed to templates. This can be
 * overridden by passing a function to the `mergeContext`
 * option.
 *
 * ```js
 * template.option('mergeContext', function(template, locals) {
 *   return extend(template.data, template.locals, locals);
 * });
 * ```
 *
 * @param  {Object} `template` Template object
 * @param  {Object} `locals`
 * @return {Object} The object to be passed to engines/templates as context.
 */

Template.prototype.mergeContext = function(template, locals) {
  if (typeof this.option('mergeContext') === 'function') {
    return this.option('mergeContext').apply(this, arguments);
  }

  var context = {};
  merge(context, this.cache.data);

  // control the order in which `locals` and `data` are merged
  if (this.enabled('preferLocals')) {
    merge(context, template.options);
    merge(context, template.data);
    merge(context, template.locals);
  } else {
    merge(context, template.locals);
    merge(context, template.data);
    merge(context, template.options);
  }

  // Partial templates to pass to engines
  merge(context, this.mergePartials(locals));
  // Merge in `locals/data` from templates
  merge(context, this.cache._context.partials);
  return context;
};

/**
 * Build the context for a specific template and type.
 *
 * ```js
 * template.mergeTypeContext('partials', 'sidenav', locals, data);
 * ```
 *
 * @param  {String} `type` Template type to merge
 * @param  {String} `key` Key of template to use
 * @param  {Object} `locals` Locals object from template
 * @param  {Object} `data` Data object from template
 * @api private
 */

Template.prototype.mergeTypeContext = function(type, key, locals, data) {
  this.cache._context[type] = this.cache._context[type] || {};
  this.cache._context[type][key] = extend({}, locals, data);
};

/**
 * Middleware error handler
 *
 * @param {Object} `template`
 * @param {String} `method` name
 * @api private
 */

function handleError(template, method) {
  return function (err) {
    if (err) {
      console.error(chalk.red('Error running ' + method + ' middleware for', template.path));
      console.error(chalk.red(err));
    }
  };
}

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
 * Utility method to define getters.
 *
 * @param  {Object} `o`
 * @param  {String} `name`
 * @param  {Function} `getter`
 * @return {Getter}
 * @api private
 */

function defineGetter(o, name, getter) {
  Object.defineProperty(o, name, {
    configurable: false,
    enumerable: false,
    get: getter,
    set: function() {}
  });
}
