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
var routes = require('en-route');
var typeOf = require('kind-of');

/**
 * Lazy requires
 */

/* deps: layouts async through2 */
var lazy = require('lazy-cache')(require);
var chalk = require('lazy-chalk');
var through = lazy('through2');
var async = lazy('async');
var layouts = lazy('layouts');
var cloneDeep = lazy('clone-deep');

/**
 * Extend Template
 */

var Plasma = require('plasma-cache');
var Config = require('config-cache');
var Engines = require('engine-cache');
var Helpers = require('helper-cache');
var Loaders = require('loader-cache');
var Options = require('option-cache');
var Router = routes.Router;

/**
 * Local modules
 */

var transforms = require('./lib/transforms');
var validate = require('./lib/validate');
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
  Plasma.call(this, {plasma: require('plasma')}, this);
  this.initTemplate(options);
}

Config.mixin(Template.prototype);

/**
 * Extend `Template`
 */

Template.Router = routes.Router;
Template.Route = routes.Route;

/**
 * Initialize defaults.
 */

Template.prototype.initTemplate = function() {
  this.engines = {};
  this.loaders = {};
  this.dataLoaders = {};
  this.inflections = {};
  this.errorsList = [];
  this.transforms = {};

  // Engine-related
  this._ = this._ || {};

  // View types
  this.type = {};
  this.type.partial = [];
  this.type.renderable = [];
  this.type.layout = [];

  this.contexts = {};
  this.contexts.subtype = {};
  this.options.subtype = {};

  // context object for partials
  this.set('_context', {});

  // View collections
  this.views = {};

  // defaults
  this.defaultConfig();
  this.defaultOptions();
  this.forwardLoaders();
  this.defaultLoaders();
  this.defaultTransforms();
};

/**
 * Initialize the default configuration.
 */

Template.prototype.defaultConfig = function() {
  this._.loaders = new Loaders(this.loaders);
  this._.engines = new Engines(this.engines);
  this._.helpers = new Helpers({bind: false});
  this._.asyncHelpers = new Helpers({bind: false});
};

/**
 * Initialize default options.
 */

Template.prototype.defaultOptions = function() {
  this.enable('silent');

  // defaults
  this.enable('default routes');
  this.enable('default engines');
  this.enable('default helpers');
  this.option('router methods', []);

  // engines
  this.option('view engine', '*');
  this.disable('debugEngine');

  this.engine('.*', function noop(str, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts; opts = {};
    }
    cb(null, str);
  });

  // layouts
  this.option('defaultLayout', null);
  this.option('layoutDelims', ['{%', '%}']);
  this.option('layoutTag', 'body');
  this.option('layoutExt', null);
  this.option('layout', null);

  // partials
  this.enable('mergePartials');

  // context
  this.disable('preferLocals');

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
 * Forward methods from [loader-cache] onto `Template.prototype`:
 *   | .loader
 *   | .loaderAsync
 *   | .loaderPromise
 *   | .loaderStream
 *   | .load
 *   | .loadAsync
 *   | .loadPromise
 *   | .loadStream
 */

Template.prototype.forwardLoaders = function() {
  var mix = utils.forward(Template.prototype, this._.loaders);
  mix('loader', 'register');
  mix('loaderAsync', 'registerAsync');
  mix('loaderPromise', 'registerPromise');
  mix('loaderStream', 'registerStream');
  mix('load');
  mix('loadAsync');
  mix('loadPromise');
  mix('loadStream');
};

/**
 * Register default loader methods
 */

Template.prototype.defaultLoaders = function() {
  this.loader('default', loaders.templates(this));
  this.loader('helpers', loaders.helpers(this));
};

/**
 * Load default transforms.
 */

Template.prototype.defaultTransforms = function() {
  this.transform('routes', transforms.middleware);
  this.transform('helpers', transforms.helpers);
  this.transform('templates', transforms.templates);
};

/**
 * Set an error message that will either `throw`, or be pushed onto
 * `errorsList` when `silent` is enabled.
 *
 * ```js
 * this.error('Error parsing string.');
 * ```
 *
 * @param {String} `methodName` The name of the method where the error is thrown.
 * @param {String} `msg` Message to use in the Error.
 * @param {Object} `file` The `value` of a template object
 * @api public
 */

Template.prototype.error = function(method, message, args) {
  var msg = 'Template#' + method;
  args = args ? JSON.stringify(args) : [];
  msg += ': ' + message;
  msg += ': ' + args;

  var err = new Error(msg);
  err.reason = msg;
  err.method = method;
  err.msg = message;
  err.args = args;

  if (this.enabled('verbose')) {
    console.error(chalk().yellow(err));
  }
  this.errorsList.push(err);
  return err;
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
  debug.transform('.transform: ', arguments);
  if (arguments.length === 1) {
    return this.transforms[name];
  }
  if (fn && typeof fn === 'function') {
    this.transforms[name] = fn;
    fn.call(this, this);
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
  debug.routes('.handle: ', arguments);
  if (typeof method === 'object') {
    done = file; file = method; method = null;
  }
  file.options = file.options || {};
  file.options.method = method;
  if (!this.router) {
    debug.routes('no routes defined on engine');
    return done();
  }
  this.router.handle(file, done);
};

/**
 * Dispatch `file` through an array of middleware functions.
 *
 * @param  {Object} `file`
 * @param  {Array} `fns`
 * @api private
 */

Template.prototype.dispatch = function(method, file, fns) {
  for (var key in file) {
    if (file.hasOwnProperty(key)) {
      var value = file[key];
      if (fns) this.route(value.path).all(fns);
      this.handle(method, value, handleError(method, {path: key}));
    }
  }
};

/**
 * Proxy to the engine `Router#route`
 * Returns a new `Route` instance for the `path`.
 *
 * Routes are isolated middleware stacks for specific paths.
 * See the `Route` api docs for details.
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
 * Proxy to `Router#param` with one added api feature. The `name` parameter
 * can be an array of names.
 *
 * See the `Router#param` docs for more details.
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
    var len = name.length, i = 0;
    while (len--) this.param(name[i++], fn);
    return this;
  }
  this.router.param(name, fn);
  return this;
};

/**
 * Proxy to `Router#use` to add middleware to the engine router.
 * See the `Router#use` documentation for details.
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
    // if the first arg is the path, offset by 1
    if (typeof arg !== 'function') {
      offset = 1;
      path = fn;
    }
  }

  var fns = flatten([].slice.call(arguments, offset));
  if (fns.length === 0) {
    throw this.error('use', 'expects middleware functions', arguments);
  }

  this.lazyrouter();
  var router = this.router;
  var len = fns.length, i = 0;

  while (len--) {
    var mfn = fns[i++];
    // non-Template instance
    if (!mfn || !mfn.handle || !mfn.set) {
      router.use(path, mfn.bind(this));
    }
    debug.routes('use: %s', path);
    mfn.mountpath = path;
    mfn.parent = this;
  }
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
    var len = arguments.length - 1;
    var args = new Array(len);

    for (var i = 0; i < len; i++) {
      args[i] = arguments[i + 1];
    }
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
 * @param {Function} `callback`
 * @return {Object} `Template` for chaining
 * @api public
 */

Template.prototype.all = function(path) {
  debug.routes('all: %s', path);
  this.lazyrouter();
  var route = this.router.route(path);
  var len = arguments.length - 1;
  var args = new Array(len);

  for (var i = 0; i < len; i++) {
    args[i] = arguments[i + 1];
  }
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

  if (typeOf(template) !== 'object') {
    throw this.error('applyLayout', 'expects an object', arguments);
  }

  // return if a layout has already been applied
  if (template.options.layoutApplied) {
    return template;
  }

  var opts = this.session && this.session.get('src') || {};
  var config = extend({}, template, locals, opts);

  template.options.layoutApplied = true;
  if (template.options.isPartial) {
    config.defaultLayout = false;
  }

  // Get the name of the (starting) layout to be used
  var layout = config.layout
    || config.locals && config.locals.layout
    || config.data && config.data.layout
    || config.options && config.options.layout;

  // If `layoutExt` is defined on the options, append
  // it to the layout name before passing the name to [layouts]
  var ext = this.option('layoutExt');
  if (typeof ext === 'string') {
    layout += utils.formatExt(ext);
  }

  // Merge `layout` collections based on settings
  var stack = this.mergeLayouts(config);
  var res = layouts()(template.content, layout, stack, config);
  if (res.options && res.options.options) {
    extend(res.options, res.options.options);
    delete res.options.options;
  }

  // add the results to the `layoutStack` property of a template
  template.options.layoutStack = res;

  // update the template content to be the
  template.content = res.result;
  return template;
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
  debug.engine('.registerEngine:', arguments);
  var opts = extend({}, options);
  ext = ext ? utils.formatExt(ext) : '';
  this._.engines.setEngine(ext, fn, opts);
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

Template.prototype.engine = function(exts, fn, opts) {
  debug.engine('.engine:', arguments);
  exts = utils.arrayify(exts);
  var len = exts.length;
  while (len--) this.registerEngine(exts[len], fn, opts);
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
  debug.engine('.getEngine: %s', ext);
  ext = ext || this.option('view engine');
  return this._.engines.getEngine(ext);
};

/**
 * Register generic template helpers that can be used with any engine.
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

Template.prototype.defaultLoad = function(subtype, plural, options) {
  var opts = extend({}, options);
  var type = opts.load || 'sync';

  return function (/*args, stack, options*/) {
    var self = this;
    var stack = [];

    // Default method used to handle sync loading when done
    var cb = function (err, template) {
      if (err) throw err;
      return template;
    };

    var len = arguments.length;
    var args = new Array(len);

    for (var i = 0; i < len; i++) {
      var arg = arguments[i];

      if (i !== 0 && typeOf(arg) === 'array') {
        stack = arg;
        args.pop();
        continue;
      } else if (i === len - 1 && typeOf(arg) === 'function') {
        if (type !== 'async') {
          var msg = subtype + ' loaders are not async.';
          throw this.error('defaultLoad callback', msg, arguments);
        }
        cb = arg;
        args.pop();
        continue;
      }
      args[i] = arg;
    }

    var last = args[args.length -1];

    // extend `file.contexts` with load locals/options
    opts.contexts = {};
    opts.contexts.create = cloneDeep()(opts);
    if (typeof last === 'object') {
      opts.contexts.load = omit(last, ['content', 'path']);
    }

    if (args.length === 1) args = args[0];

    var loadOpts = {};
    loadOpts.matchLoader = function () {
      return subtype;
    };

    /**
     * Default done function for normalization, validation,
     * and extending the views when finished loading
     */
    function done(err, template) {
      if (err) return cb(err);
      template = self.normalize(subtype, plural, template, opts);

      // validate the template object before moving on
      self.validate(template);
      // Add template to the cache
      extend(self.views[plural], template);
      return cb(null, template);
    }

    args = [args];
    args.push(stack);
    args.push(loadOpts);
    args = args.filter(Boolean);

    // Choose loaders based on loader type
    switch (type) {
      case 'async':
        self.loadAsync.apply(self, args.concat(done));
        break;
      case 'promise':
        return self.loadPromise.apply(self, args)
          .then(function (template) {
            return done(null, template);
          });
      case 'stream':
        return self.loadStream.apply(self, args)
          .on('data', function (template) {
            done(null, template);
          })
          .on('error', done);
      default:
        return done(null, self.load.apply(self, args));
    }
  };
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

Template.prototype.normalize = function(subtype, plural, template, options) {
  debug.template('normalizing: [%s]: %j', plural, template);
  this.lazyrouter();

  if (this.option('normalize')) {
    return this.options.normalize.apply(this, arguments);
  }

  var opts = cloneDeep()(options || {});
  var context = opts.contexts || {};
  delete opts.contexts;

  opts.subtype = subtype;
  opts.collection = plural;

  for (var key in template) {
    if (template.hasOwnProperty(key)) {
      var file = template[key];

      file.contexts = extend({}, file.contexts, context);
      file.options = extend({}, opts, file.options);
      file.contexts.create = opts;
      file.options.create = opts;

      // run this file's `.onLoad` middleware stack
      this.handle('onLoad', file, handleError('onLoad', {path: key}));
      template[key] = file;
    }
  }
  return template;
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
  // renderable views
  if (opts.isRenderable && this.type.renderable.indexOf(plural) === -1) {
    this.type.renderable.push(plural);
  }
  // layout views
  if (opts.isLayout && this.type.layout.indexOf(plural) === -1) {
    this.type.layout.push(plural);
  }
  // partial views
  if (opts.isPartial || (!opts.isRenderable && !opts.isLayout)) {
    if (this.type.partial.indexOf(plural) === -1) {
      this.type.partial.push(plural);
    }
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

Template.prototype.setLoaders = function(subtype, plural, options, stack) {
  var type = (options && options.load) || 'sync';
  if (this._.loaders.cache[type] && this._.loaders.cache[type][subtype]) {
    delete this._.loaders.cache[type][subtype];
  }
  if (stack.length === 0) {
    stack.push(['default']);
  }
  if (!Array.isArray(stack[0])) {
    stack = [stack];
  }
  var loader = type !== 'sync' ? utils.methodName('loader', type) : 'loader';
  stack.unshift(subtype);
  this[loader].apply(this, stack);
};

/**
 * Get a view `collection` by its singular or plural name.
 *
 * ```js
 * var pages = template.getViews('pages');
 * //=> { pages: {'home.hbs': { ... }}
 *
 * var posts = template.getViews('posts');
 * //=> { posts: {'2015-10-10.md': { ... }}
 * ```
 *
 * @param {String} `name` Collection name.
 * @return {Object}
 * @api public
 */

Template.prototype.getViews = function(plural) {
  if (!this.views.hasOwnProperty(plural)) {
    plural = this.inflections[plural];
  }
  return this.views[plural];
};

/**
 * Get a specific template from the specified collection.
 *
 * @param {String} `name` Template name
 * @param {String} `collection` Collection name
 * @return {Object}
 * @api public
 */

Template.prototype.getView = function(collection, name) {
  if (!name) return this.error('getView', 'expects a template name.');
  var views = this.getViews(collection);
  if (!views) {
    throw this.error('getView', 'can\'t find collection', arguments);
  }
  if (views.hasOwnProperty(name)) {
    return views[name];
  }
  var fn = this.option('renameKey');
  if (typeof fn === 'function') {
    name = fn(name);
  }
  if (views.hasOwnProperty(name)) {
    return views[name];
  }
  if (this.enabled('strict errors')) {
    throw this.error('getView', 'can\'t find view', arguments);
  }
  return '';
};

/**
 * Convenience method for finding a specific template by `name` on
 * the given collection. Optionally specify a file extension.
 *
 * @param {String} `plural` The view collection to search.
 * @param {String} `name` The name of the template.
 * @param {String} `ext` Optionally pass a file extension to append to `name`
 * @api public
 */

Template.prototype.lookup = function(collection, name, ext) {
  var views = this.getViews(collection || 'pages');
  if (views.hasOwnProperty(name)) {
    return views[name];
  }

  var idx = name.indexOf('.');
  var hasExt = idx !== -1;

  var base = hasExt ? name.slice(0, idx) : name;
  if (hasExt && views.hasOwnProperty(base)) {
    return views[base];
  }

  var key = name + (ext || '.md');
  if (views.hasOwnProperty(key)) {
    return views[key];
  }

  var fn = this.option('renameKey');
  if (typeof fn === 'function') {
    name = fn(name);
  }

  if (views.hasOwnProperty(key)) {
    return views[key];
  }

  if (this.enabled('strict errors')) {
    throw this.error('lookup', 'can\'t find view', arguments);
  }
  return null;
};

/**
 * Get all view collections of the given [type].
 *
 * ```js
 * var renderable = template.getType('renderable');
 * //=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
 * ```
 *
 * @param {String} `type` Types are `renderable`, `layout` and `partial`.
 * @api public
 */

Template.prototype.getType = function(type, subtypes) {
  debug.template('getting type: %s', type);
  if (typeof type !== 'string') {
    throw this.error('getType', 'expects a string', arguments);
  }

  var keys = typeof subtypes !== 'undefined'
    ? utils.arrayify(subtypes)
    : this.type[type];

  var len = keys.length, i = 0;
  var res = {};

  while (len--) {
    var plural = keys[i++];
    res[plural] = this.views[plural];
  }
  return res;
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
  debug.template('merging [type]: %s', type);
  var collections = this.getType.apply(this, arguments);
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
  debug.template('merging layouts: %j', fn);

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
  debug.template('merging partials [%s]: %j', arguments);

  var mergePartials = this.option('mergePartials');
  if (typeof mergePartials === 'function') {
    return mergePartials.call(this, context);
  }

  var opts = context.options || {};
  if (mergePartials === true) {
    opts.partials = cloneDeep()(context.partials || {});
  }

  var mergeTypeContext = this.mergeTypeContext(this, 'partials');
  var arr = this.type.partial;
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
        var layoutOpts = this.cache._context.partials[key];
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
 * Find a template based on its `type`. `.find` returns the first
 * template that matches the given `key`.
 *
 * Searches all views of [view-subtypes][subtypes] of the given [type], returning
 * the first template found with the given `key`. Optionally pass
 * an array of `subtypes` to limit the search;
 *
 * ```js
 * template.find('renderable', 'home', ['page', 'post']);
 * ```
 *
 * @param {String} `type` The template type to search.
 * @param {String} `key` The template to find.
 * @param {Array} `subtypes`
 * @api public
 */

Template.prototype.find = function(type, name, subtypes) {
  if (typeof type !== 'string') {
    throw this.error('find', 'expects `type` to be a string', arguments);
  }
  if (typeof name !== 'string') {
    throw this.error('find', 'expects `name` to be a string', arguments);
  }
  var collection = this.getType(type, subtypes);
  for (var key in collection) {
    var views = collection[key];
    if (views.hasOwnProperty(name)) {
      return views[name];
    }
  }
  // don't throw an error since other methods
  // will continue looking if this fails
  return null;
};

/**
 * Search all renderable `subtypes`, returning the first template
 * with the given `key`.
 *
 *   - If `key` is not found `null` is returned
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
 *   - If `key` is not found `null` is returned
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
 *   - If `key` is not found `null` is returned
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
 * @param {String} `plural` Plural name of the collection, e.g. `pages`.
 * @param {Object} `options` Options for the collection.
 * @option {Boolean} `isRenderable` Templates that may be rendered at some point
 * @option {Boolean} `isLayout` Templates to be used as layouts
 * @option {Boolean} `isPartial` Templates to be used as partial views or includes
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
  var opts = extend({}, options);
  stack = utils.arrayify(stack || []);

  // add an object to `views` for this template type
  this.views[plural] = this.views[plural] || {};
  opts = this.setType(subtype, plural, opts);

  // add loaders to default loaders
  this.setLoaders(subtype, plural, opts, stack);

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
  var fn = this.defaultLoad(subtype, plural, opts);

  // store a context and options for the subtype
  this.options.subtype[plural] = this.contexts[plural] = opts;

  // make a `plural` convenience method, ex: `.pages`
  mixin(plural, fn);

  // make a `singular` convenience method, ex: `.page`
  mixin(subtype, fn);

  // Add a `get` method to `Template` for `subtype`
  mixin(utils.methodName('get', subtype), function (key) {
    return this.views[plural][key];
  });

  // Add a `render` method to `Template` for `subtype`
  mixin(utils.methodName('render', subtype), function () {
    return this.renderSubtype(subtype);
  });

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
};

/**
 * Base compile method. Use `engine` to compile `content` with the
 * given `options`
 *
 * @param  {Object} `engine` Engine object, with `.compile` method
 * @param  {Object} `content` The content string to compile.
 * @param  {Object} `options` options to pass to registered view engines.
 * @return {Function} The compiled template string.
 * @api private
 */

Template.prototype.compileBase = function(engine, content, options) {
  debug.render('compileBase:', arguments);
  if (!utils.hasOwn(engine, 'compile')) {
    throw this.error('compileBase', '`.compile` method not found', engine);
  }
  try {
    return engine.compile(content, options);
  } catch (err) {
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

Template.prototype.compileTemplate = function(template, options, isAsync) {
  debug.render('compileTemplate: %j', template);

  if (typeOf(template) !== 'object') {
    throw this.error('compileTemplate', 'expects an object', template);
  }

  // reference to options in case helpers are needed later
  var opts = options || {};
  var context = opts.context || {};
  delete opts.context;
  opts.async = isAsync;

  // handle pre-compile middleware routes
  this.handle('preCompile', template, handleError('preCompile', template));

  // if a layout is defined, apply it before compiling
  this.applyLayout(template, extend({}, context, opts));

  // handle post-compile middleware
  this.handle('postCompile', template, handleError('postCompile', template));

  // Bind context to helpers before passing to the engine.
  this.bindHelpers(opts, context, isAsync);
  opts.debugEngine = this.option('debugEngine');

  // get the engine to use
  var engine = this.getEngine(template.engine);

  // compile template
  return this.compileBase(engine, template.content, opts);
};

/**
 * Compile `content` with the given `options`.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `options`
 * @param  {Boolean} `isAsync` Load async helpers
 * @return {Function} Compiled function.
 * @api public
 */

Template.prototype.compile = function(content, options, isAsync) {
  debug.render('compile:', arguments);

  if (typeOf(content) === 'object') {
    return this.compileTemplate(content, options, isAsync);
  }

  if (typeof content !== 'string') {
    throw this.error('compile', 'expects a string or object', content);
  }

  var template = this.findRenderable(content);
  if (typeOf(template) === 'object') {
    return this.compileTemplate(template, options, isAsync);
  }
  return this.compileString(content, options, isAsync);
};

/**
 * Compile the given string with the specified `options`.
 *
 * The primary purpose of this method is to get the engine before
 * passing args to `.compileBase`.
 *
 * @param  {String} `str` The string to compile.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @param  {Boolean} `async` Load async helpers
 * @return {Function}
 * @api public
 */

Template.prototype.compileString = function(str, options, isAsync) {
  debug.render('render string:', arguments);
  if (typeof str !== 'string') {
    throw this.error('compileString', 'expects a string', str);
  }

  if (typeof options === 'boolean') {
    isAsync = options;
    options = {};
  }
  options = extend({locals: {}}, options);
  var locals = options.locals;

  var template = { content: str, locals: locals, options: options };
  return this.compileTemplate(template, options, isAsync);
};

/**
 * Base render method. Use `engine` to render `content` with the
 * given `options` and `callback`.
 *
 * @param  {Object} `engine` Engine object, with `.render` and/or `.renderSync` method(s)
 * @param  {Object} `content` The content string to render.
 * @param  {Object} `options` Locals and/or options to pass to registered view engines.
 * @param  {Function} `cb` If a callback is passed, `.render` is used, otherwise `.renderSync` is used.
 * @return {String} The rendered template string.
 * @api private
 */

Template.prototype.renderBase = function(engine, content, options, cb) {
  debug.render('renderBase:', arguments);
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
  debug.render('renderTemplate: %j', template);
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  if (typeOf(template) !== 'object') {
    return cb(this.error('renderTemplate', 'expects an object', template));
  }

  // find any options passed in on locals
  locals = locals || {};
  template.path = template.path || '.';
  var app = this;

  // handle pre-render middleware routes
  this.handle('preRender', template, handleError('preRender', template));

  // Merge `.render` locals with template locals
  locals = this.mergeContext(template, locals);

  // shallow clone any options set on the `locals` object
  var opts = extend({}, locals.options);

  // find the engine to use for rendering templates
  var engine = this.getEngine(template.engine);
  var isAsync = typeOf(cb) === 'function';

  // compile the template if it hasn't been already
  if (typeOf(template.fn) !== 'function') {
    opts.context = opts.context || locals;
    opts.delims = engine.options.delims;
    template.fn = this.compileTemplate(template, opts, isAsync);
  }

  // for engines that don't support compile, we need to merge
  // in the `context` and `delims` for backwards compatibility
  if (typeof content === 'string') {
    locals = extend({}, locals, opts);
  }

  var content = template.fn;
  if (!isAsync) {
    template.content = this.renderBase(engine, content, locals, cb);
    // handle post-render middleware routes
    this.handle('postRender', template, handleError('postRender', template));
    return template.content;
  }

  return this.renderBase(engine, content, locals, function (err, content) {
    if (err) {
      return cb.call(app, err);
    }

    // update the `content` property with the rendered result, so we can
    // pass the entire template object to the postRender middleware
    template.content = content;
    app.handle('postRender', template, handleError('postRender', template));

    // final rendered string
    return cb.call(app, null, template.content);
  });
};

/**
 * Base sync render method. Uses the given `engine` to render
 * `content` with the given `options`.
 *
 * @param  {Object} `engine` Engine object must have a `.renderSync` method.
 * @param  {Object} `content` The content string to render.
 * @param  {Object} `options` Locals and/or options to pass to registered view engines.
 * @return {String} The rendered template string.
 * @api private
 */

Template.prototype.renderSync = function(engine, content, options) {
  if (!utils.hasOwn(engine, 'renderSync')) {
    throw this.error('renderSync', '.renderSync method not found on engine', engine);
  }
  try {
    return engine.renderSync(content, options);
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Base async render method. Uses the given `engine` to render
 * `content` with the given `options` and `callback`.
 *
 * @param  {Object} `engine` Engine object, with `.render` and/or `.renderSync` method(s)
 * @param  {Object} `content` The content string to render.
 * @param  {Object} `options` Locals and/or options to pass to registered view engines.
 * @param  {Function} `cb` If a callback is passed, `.render` is used, otherwise `.renderSync` is used.
 * @return {String} The rendered template string.
 * @api private
 */

Template.prototype.renderAsync = function(engine, content, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (!utils.hasOwn(engine, 'render')) {
    return cb(this.error('renderAsync', 'no .render method found on engine', engine));
  }

  try {
    var app = this;
    engine.render(content, options, function (err, res) {
      if (err) return cb(err);
      return cb.call(app, null, res);
    });
  } catch (err) {
    return cb.call(app, err);
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
  debug.render('render:', arguments);
  if (content == null) {
    throw this.error('render', 'expects a string or object', arguments);
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
 * passing args to `.renderBase`.
 *
 * @param  {String} `str` The string to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderString = function(str, locals, cb) {
  debug.render('render string: %s', str);
  if (typeof str === 'undefined') {
    throw this.error('renderString', 'expects a string', arguments);
  }
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  var template = { content: str, locals: locals || {}};
  return this.renderTemplate(template, locals, cb);
};

/**
 * Render the given string with the specified `locals` and `callback`.
 *
 * The primary purpose of this method is to get the engine before
 * passing args to `.renderBase`.
 *
 * @param  {String} `str` The string to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderFile = function(locals) {
  var app = this;
  return through().obj(function (file, enc, cb) {
    locals = merge({}, locals, file.locals);

    // handle onLoad middleware
    app.handle('onLoad', file, handleError('onLoad', {path: file.path}));
    var ctx = merge({}, file.data, locals);

    var stream = this;
    file.render(ctx, function (err, content) {
      if (err) {
        stream.emit('error', new PluginError('renderFile', err));
        return cb(err);
      }
      file.rendered = true;
      file.contents = new Buffer(content);
      stream.push(file);
      return cb();
    });
  });
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
  if (typeof subtype === 'undefined') {
    throw this.error('renderSubtype', 'expects a string', subtype);
  }

  // get the plural name of the given subtype
  var plural = this.inflections[subtype];
  var app = this;

  return function (key, locals, cb) {
    debug.render('rendering subtype:', arguments);
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }
    // Return the first matching template from a `renderable` subtype
    var template = app.lookup(plural, key);
    if (!template) {
      return cb(app.error('renderSubtype', 'can\'t find ' + key, arguments));
    }

    return template.render(locals, cb);
  };
};

/**
 * Returns a function for rendering a template of the given `type` and `subtype`.
 *
 * @param  {String} `str` The string to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderType = function(type, plural) {
  debug.render('renderType:', arguments);
  var collections = {};
  var app = this;

  if (typeof plural !== 'undefined') {
    collections = this.views[plural];
  }

  return function (key, locals, cb) {
    debug.render('rendering type:', arguments);
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var template;
    try {
      template = app.find(type, key, plural);
    } catch(err) {
      return cb(err);
    }
    return template.render(locals, cb);
  };
};

/**
 * Render each item in a collection.
 *
 * ```js
 * template.renderEach('pages', function(err, res) {
 *   //=> array of rendered page objects
 * });
 * ```
 *
 * @param  {String} `collection` The name of the collection to render.
 * @param  {Object} `locals` Locals object and/or options to pass to the engine as context.
 * @return {Array} Array of rendered strings.
 * @api public
 */

Template.prototype.renderEach = function(collection, locals, cb) {
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  var views = this.getViews(collection);
  var keys = Object.keys(views);

  async().map(keys, function (key, next) {
    var file = views[key];
    file.render(locals, function (err, content) {
      if (err) return next(err);

      file.content = content;
      return next(null, file);
    });
  }, cb);
};

/**
 * Expose the current context as `this` in helpers.
 *
 *   - Exposes `locals` on the `context` property
 *   - Exposes `Template` on the `app` property
 *
 * @param  {Object} `options` Additional options that may contain helpers
 * @param  {Object} `context` Used as the context to bind to helpers
 * @param  {Boolean} `isAsync` Pass `true` if the helper is async.
 * @return {Object}
 */

Template.prototype.bindHelpers = function (options, context, isAsync) {
  debug.helper('binding helpers: %j %j', context, options);

  var helpers = {};
  extend(helpers, this.options.helpers);
  extend(helpers, this._.helpers);

  if (isAsync) {
    extend(helpers, this._.asyncHelpers);
  }
  extend(helpers, options.helpers);

  // build the context to be exposed as `this` in helpers
  var ctx = {};
  ctx.options = extend({}, this.options, options);
  ctx.context = context || {};
  ctx.app = this;

  options.helpers = utils.bindAll(helpers, ctx);
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
  merge(context, template.options);

  // control the order in which `locals` and `data` are extendd
  if (this.enabled('preferLocals')) {
    merge(context, template.data);
    merge(context, template.locals);
  } else {
    merge(context, template.locals);
    merge(context, template.data);
  }

  // add partials to the context to pass to engines
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

Template.prototype.mergeTypeContext = function (app, type) {
  return function(key, locals, data) {
    app.cache._context[type] = app.cache._context[type] || {};
    app.cache._context[type][key] = extend({}, locals, data);
  };
};

/**
 * Middleware error handler
 *
 * @param {Object} `template`
 * @param {String} `method` name
 * @api private
 */

function handleError(method, template) {
  return function (err) {
    if (err) {
      err.reason = 'Error running ' + method + ' middleware: ' + JSON.stringify(template);
      console.error(err);
      return err;
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
 * Expose `Template`
 */

module.exports = Template;
