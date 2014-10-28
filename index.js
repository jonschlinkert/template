/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

// process.env.DEBUG = 'engine:*';

var _ = require('lodash');
var path = require('path');
var chalk = require('chalk');
var Delims = require('delims');
var forOwn = require('for-own');
var Layouts = require('layouts');
var Router = require('en-route').Router;
var Route = require('en-route').Route;
var Cache = require('config-cache');
var Helpers = require('helper-cache');
var Engines = require('engine-cache');
var engineLodash = require('engine-lodash');
var engineNoop = require('engine-noop');
var parserMatter = require('parser-front-matter');
var parserNoop = require('parser-noop');
var Loader = require('load-templates');
var slice = require('array-slice');
var flatten = require('arr-flatten');

var init = require('./lib/middleware/init');
var decorate = require('./lib/decorate');
var utils = require('./lib/utils');
var debug = require('./lib/debug');
var extend = _.extend;


/**
 * Create a new instance of `Engine`, optionally passing
 * default `options` to initialize with.
 *
 * **Example:**
 *
 * ```js
 * var Engine = require('engine');
 * var engine = new Engine();
 * ```
 *
 * @class `Engine`
 * @param {Object} `options` Options to initialize with.
 * @api public
 */

var Engine = module.exports = Cache.extend({
  constructor: function(options) {
    Engine.__super__.constructor.call(this, options);
    this.initEngine();
  }
});

Engine.extend = Cache.extend;
Engine.Router = Router;
Engine.Route = Route;


/**
 * Initialize defaults.
 *
 * @api private
 */

Engine.prototype.initEngine = function() {
  this.engines = this.engines || {};
  this.delims = this.delims || {};

  this._ = {};
  this.templateType = {};
  this.templateType.partial = [];
  this.templateType.renderable = [];
  this.templateType.layout = [];
  this.layoutSettings = {};

  this.defaultConfig();
  this.defaultOptions();
  this.defaultDelimiters();
  this.defaultRoutes();
  this.defaultTemplates();
  this.defaultEngines();
};


/**
 * Initialize the default configuration.
 *
 * @api private
 */

Engine.prototype.defaultConfig = function() {
  this._.delims = new Delims(this.options);
  this._.engines = new Engines(this.engines);

  this._.helpers = new Helpers({
    bindFunctions: true,
    thisArg: this
  });

  this._.asyncHelpers = new Helpers({
    bindFunctions: true,
    thisArg: this
  });

  this.set('mixins', {});
  this.set('locals', {});
  this.set('imports', {});
  this.set('layouts', {});
  this.set('partials', {});
  this.set('anonymous', {});
  this.set('pages', {});
};


/**
 * Initialize default options.
 *
 * @api private
 */

Engine.prototype.defaultOptions = function() {
  this.option('cache', true);
  this.option('strictErrors', true);
  this.option('pretty', false);

  this.option('cwd', process.cwd());
  this.option('ext', '*');
  this.option('defaultExts', ['md', 'html', 'hbs']);
  this.option('destExt', '.html');
  this.option('delims', ['<%', '%>']);
  this.option('viewEngine', '*');
  this.option('layoutTag', 'body');
  this.option('layoutDelims', ['{%', '%}']);
  this.option('layoutExt', null);
  this.option('layout', null);

  this.enable('built-in:engines');

  this.option('preprocess', true);
  this.option('preferLocals', false);
  this.option('partialLayout', null);
  this.option('mergePartials', true);
  this.option('mergeFunction', extend);
  this.option('bindHelpers', true);

  // Custom function for naming partial keys
  this.option('partialsKey', function (fp) {
    return path.basename(fp, path.extname(fp));
  });

  // Custom function for all other template keys
  this.option('renameKey', function (fp) {
    return path.basename(fp);
  });
};


/**
 * Load default routes / middleware
 *
 *   - `.md`: parse front matter in markdown files
 *   - `.hbs`: parse front matter in handlebars templates
 *   - `.*`: use the noop engine for any unclaimed extensions. This just
 *           passes files through but adds expected properties to the
 *           template object if they don't already exist.
 *
 * @api private
 */

Engine.prototype.defaultRoutes = function() {
  this.route(/\.(md|hbs)$/).all(function route(file, next) {
    parserMatter.parse(file, function(err) {
      if (err) {
        console.log('route [md|hbs]:', chalk.red(err));
        next(err);
        return;
      }
      next();
    });
  });

  this.route(/.*/).all(function route(file, next) {
    parserNoop.parse(file, function(err) {
      if (err) {
        console.log('route [*]:', chalk.red(err));
        next(err);
        return;
      }
      next();
    });
  });
};


/**
 * Load default engines.
 *
 *   - `*` The noop engine is used as a pass-through when no other engine matches.
 *   - `md|html|hbs`. [engine-lodash] will process templates  in any files with these
 *                    extensions. To change or negate these extensions, just do
 *                    `engine.option('defaultExts', ['foo', 'bar', 'baz'])`.
 *
 * @api private
 */

Engine.prototype.defaultEngines = function() {
  if (this.enabled('built-in:engines')) {
    this.engine(this.option('defaultExts'), engineLodash, {
      layoutDelims: ['{%', '%}'],
      destExt: '.html'
    });
    this.engine('*', engineNoop, {
      layoutDelims: ['{%', '%}'],
      destExt: '.html'
    });
  }
};


/**
 * Register default template delimiters.
 *
 *   - engine delimiters: Delimiters used in templates process by [engine-lodash], the default engine.
 *   - layout delimiters: Delimiters used in layouts.
 *
 * @api private
 */

Engine.prototype.defaultDelimiters = function() {
  this.addDelims('*', ['<%', '%>'], ['{%', '%}']);
};


/**
 * Register default template types.
 *
 * @api private
 */

Engine.prototype.defaultTemplates = function() {
  this.create('page', { isRenderable: true });
  this.create('layout', { isLayout: true });
  this.create('partial', { isPartial: true });
};


/**
 * Create helpers for each default template `type`.
 *
 * @api private
 */

Engine.prototype.typeHelpers = function(type, plural) {
  this.addHelper(type, function (key, locals) {
    var partial = this.cache[plural][key];

    partial = this.stashLocals(type, partial, locals);

    var content = this.renderSync(partial, locals);
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

Engine.prototype.typeHelpersAsync = function(type, plural) {
  this.addHelperAsync(type, function (name, locals, next) {
    debug.helper('#{creating async type helper}:', name);
    var last = _.last(arguments);

    if (typeof locals === 'function') {
      next = locals;
      locals = {};
    }
    if (typeof next !== 'function') {
      next = last;
    }

    var partial = this.cache[plural][name];
    if (partial) {
      this.stashLocals('typeHelpersAsync', partial, locals);
    }

    if (!partial) {
      var msg = chalk.red('helper {{' + type + ' "' + name + '"}} not found.');
      console.log(msg);
      next(null, '');
      return;
    }

    partial.locals = extend({}, partial.locals, partial.data, locals);
    debug.helper('#{async helper partial}:', partial);

    this.render(partial, partial.locals, function (err, content) {
      debug.helper('#{async helper rendering}:', content);
      if (err) {
        console.log('asyncHelpers:', chalk.red(err));
        next(err);
        return;
      }
      next(null, content);
      return;
    });
  }.bind(this));
};


/**
 * Lazily initalize router, to allow options to
 * be passed in after init.
 *
 * @api private
 */

Engine.prototype.lazyrouter = function() {
  if (!this.router) {
    this.router = new Router({
      caseSensitive: this.enabled('case sensitive routing'),
      strict: this.enabled('strict routing')
    });
    this.router.use(init(this));
  }
};


/**
 * Dispatch a template through a middleware stack
 *
 * @param  {arguments} `arguments` Any arguments that should be passed through the middleware stack
 * @api private
 */

Engine.prototype.handle = function(file, done) {
  debug.routes('#routes:handle', arguments);
  var router = this.router;

  // no routes
  if (!router) {
    debug('no routes defined on engine');
    done();
    return;
  }

  if (typeof file === 'string') {
    // lookup the file
  }

  router.handle(file, done);
};

/**
 * Proxy `Router#use()` to add middleware to the engine router.
 * See Router#use() documentation for details.
 *
 * If the _fn_ parameter is an engine, then it will be
 * mounted at the _route_ specified.
 *
 * @api public
 */

Engine.prototype.use = function (fn) {
  var offset = 0;
  var path = '/';

  // default path to '/'
  // disambiguate engine.use([fn])
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
    throw new TypeError('engine.use() requires middleware functions');
  }

  // setup router
  this.lazyrouter();
  var router = this.router;

  fns.forEach(function (fn) {
    // non-engine instance
    if (!fn || !fn.handle || !fn.set) {
      return router.use(path, fn);
    }

    debug('.use engine under %s', path);
    fn.mountpath = path;
    fn.parent = this;

    // // restore .app property on req and res
    // router.use(path, function mounted_app(file, next) {
    //   fn.handle(file, function (err) {
    //     next(err);
    //   });
    // });

    // mounted an app
    // fn.emit('mount', this);
  }, this);

  return this;
};


/**
 * Proxy to the engine `Router#route()`
 * Returns a new `Route` instance for the _path_.
 *
 * Routes are isolated middleware stacks for specific paths.
 * See the Route api docs for details.
 *
 * @api public
 */

Engine.prototype.route = function(path){
  this.lazyrouter();
  return this.router.route(path);
};

/**
 * Proxy to `Router#param()` with one added api feature. The _name_ parameter
 * can be an array of names.
 *
 * See the Router#param() docs for more details.
 *
 * @param {String|Array} `name`
 * @param {Function} `fn`
 * @return {engine} for chaining
 * @api public
 */

Engine.prototype.param = function(name, fn){
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
 * Special-cased "all" method, applying the given route `path`,
 * middleware, and callback.
 *
 * @param {String} `path`
 * @param {Function} ...
 * @return {engine} for chaining
 * @api public
 */

Engine.prototype.all = function(path){
  this.lazyrouter();

  var route = this.router.route(path);
  var args = slice(arguments, 1);
  route.all.apply(route, args);
  return this;
};

/**
 * Lazily add a `Layout` instance if it has not yet been added.
 * Also normalizes settings to pass to the `layouts` library.
 *
 * We can't instantiate `Layout` in the defaultConfig because
 * it reads settings which might not be set until after init.
 *
 * @api private
 */

Engine.prototype.lazyLayouts = function(ext, options) {
  if (!hasOwn(this.layoutSettings, ext)) {
    var opts = extend({}, this.options, options);

    debug.layout('#{lazyLayouts} ext: %s', ext);

    this.layoutSettings[ext] = new Layouts({
      delims: opts.layoutDelims,
      layouts: opts.layouts,
      locals: opts.locals,
      tag: opts.layoutTag,
    });
  }
};


/**
 * If a layout is defined, apply it. Otherwise just return the content as-is.
 *
 * @param  {String} `ext` The layout settings to use.
 * @param  {Object} `template` Template object, with `content` to be wrapped with a layout.
 * @return  {String} Either the string wrapped with a layout, or the original string if no layout was found.
 * @api private
 */

Engine.prototype.applyLayout = function(ext, template, locals) {
  debug.layout('#{lazyLayouts} ext: %s', ext);

  var layout = utils.determineLayout(template, locals, true);
  var layoutEngine = this.layoutSettings[path.extname(layout)];
  if (!layoutEngine) {
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }
    layoutEngine = this.layoutSettings[ext];
  }

  var optsExt = this.option('layoutExt');
  if (optsExt) {
    if (optsExt[0] !== '.') {
      optsExt = '.' + optsExt;
    }
    layout = layout + optsExt;
  }

  var obj = utils.pickContent(template);
  obj = this.stashLocals('applyLayout', obj, locals);

  if (layoutEngine && !template.options.hasLayout) {
    debug.layout('#{applying layout} settings: ', layoutEngine);
    template.options.hasLayout = true;

    var opts = {};
    if (utils.isPartial(template)) {
      opts.defaultLayout = false;
    }

    var result = layoutEngine.render(obj.content, layout, opts);
    return result.content;
  }
  return obj.content;
};


/**
 * Pass custom delimiters to Lo-Dash.
 *
 * **Example:**
 *
 * ```js
 * engine.makeDelims(['{%', '%}'], ['{{', '}}'], opts);
 * ```
 *
 * @param  {Array} `arr` Array of delimiters.
 * @param  {Array} `layoutDelims` layout-specific delimiters to use. Default is `['{{', '}}']`.
 * @param  {Object} `options` Options to pass to [delims].
 * @api private
 */

Engine.prototype.makeDelims = function(arr, options) {
  var settings = extend({}, options, { escape: true });

  if (!Array.isArray(arr)) {
    return extend(options, this.getDelims('*'));
  }

  var delims = this._.delims.templates(arr, settings);
  debug.delims('#{making delims}: ', delims);
  return extend({}, delims, options);
};


/**
 * Cache delimiters by `name` with the given `options` for later use.
 *
 * **Example:**
 *
 * ```js
 * engine.addDelims('curly', ['{%', '%}']);
 * engine.addDelims('angle', ['<%', '%>']);
 * engine.addDelims('es6', ['#{', '}'], {
 *   // override the generated regex
 *   interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
 * });
 * ```
 *
 * [delims]: https://github.com/jonschlinkert/delims "Generate regex for delimiters"
 *
 * @param {String} `name` The name to use for the stored delimiters.
 * @param {Array} `delims` Array of delimiter strings. See [delims] for details.
 * @param {Object} `opts` Options to pass to [delims]. You can also use the options to
 *                        override any of the generated delimiters.
 * @api public
 */

Engine.prototype.addDelims = function(ext, arr, layoutDelims, settings) {
  debug.delims('#{adding delims} ext: %s, delims:', ext, arr);
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  if (Array.isArray(layoutDelims)) {
    this.lazyLayouts(ext, {layoutDelims: layoutDelims}, settings || {});
  } else {
    settings = layoutDelims;
    layoutDelims = this.option('layoutDelims');
  }

  var delims = extend({}, this.makeDelims(arr, settings), settings);
  this.delims[ext] = delims;
  return this;
};


/**
 * The `ext` of the stored delimiters to pass to the current delimiters engine.
 * The engine must support custom delimiters for this to work.
 *
 * @param  {Array} `ext` The name of the stored delimiters to pass.
 * @api private
 */

Engine.prototype.getDelims = function(ext) {
  debug.delims('#{getting delims} ext: %s', ext);
  if (ext && ext[0] !== '.') {
    ext = '.' + ext;
  }

  if(hasOwn(this.delims, ext)) {
    return this.delims[ext];
  }

  ext = this.currentDelims || '.default';
  return this.delims[ext];
};


/**
 * Specify by `ext` the delimiters to make active.
 *
 * ```js
 * engine.useDelims('curly');
 * engine.useDelims('angle');
 * ```
 *
 * @param {String} `ext`
 * @api public
 */

Engine.prototype.useDelims = function(ext) {
  debug.delims('#{using delims} ext: %s', ext);
  if (ext && ext[0] !== '.') {
    ext = '.' + ext;
  }
  return this.currentDelims = ext;
};


/**
 * Private method for registering an engine.
 *
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Object} `Engine` to enable chaining
 * @api private
 */

Engine.prototype.registerEngine = function(ext, fn, options) {
  var opts = extend({ thisArg: this, bindFunctions: true }, options);
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  debug.engine('#{register} args:', arguments);
  debug.engine('#{register} ext: %s', ext);

  this._.engines.register(ext, fn, opts);

  if (opts.delims) {
    this.addDelims(ext, opts.delims);
    this.engines[ext].delims = this.getDelims(ext);
  }

  this.lazyLayouts(ext, opts);
  return this;
};


/**
 * Register the given view engine callback `fn` as `ext`. If only `ext`
 * is passed, the engine registered for `ext` is returned. If no `ext`
 * is passed, the entire cache is returned.
 *
 * @doc api-engine
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Object} `Engine` to enable chaining
 * @api public
 */

Engine.prototype.engine = function(extension, fn, options) {
  debug.engine('#{engine} args: ', arguments);
  utils.arrayify(extension).forEach(function(ext) {
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }
    this.registerEngine(ext, fn, options);
  }.bind(this));
  return this;
};


/**
 * Get the engine registered for the given `ext`. If no
 * `ext` is passed, the entire cache is returned.
 *
 * ```js
 * engine.getEngine('.html');
 * ```
 *
 * @doc api-getEngine
 * @param {String} `ext` The engine to get.
 * @return {Object} Object of methods for the specified engine.
 * @api public
 */

Engine.prototype.getEngine = function(ext) {
  debug.engine('#{getEngine} ext: %s', ext);
  var engine = this._.engines.get(ext);
  engine.options.thisArg = null;
  return engine;
};


/**
 * Assign mixin `fn` to `name` or return the value of `name`
 * if no other arguments are passed.
 *
 * This method sets mixins on the cache, which will later be
 * passed to a template engine that uses mixins, such as
 * Lo-Dash or Underscore.
 *
 * @param {String} `name` The name of the mixin to add.
 * @param {Function} `fn` The actual mixin function.
 * @api private
 */

Engine.prototype.addMixin = function(name, fn) {
  if (arguments.length === 1) {
    return this.cache.mixins[name];
  }
  this.cache.mixins[name] = fn;
  return this;
};


/**
 * Register a helper for the given `ext` (engine).
 *
 * ```js
 * engine.addHelper('lower', function(str) {
 *   return str.toLowerCase();
 * });
 * ```
 *
 * @param {String} `ext` The engine to register helpers with.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Engine.prototype.helper = function(ext) {
  debug.helper('#{helper} ext: %s', ext);
  return this.getEngine(ext).helpers;
};


/**
 * Register an object of helpers for the given `ext` (engine).
 *
 * ```js
 * engine.helpers(require('handlebars-helpers'));
 * ```
 *
 * @param {String} `ext` The engine to register helpers with.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Engine.prototype.helpers = function(ext) {
  debug.helper('#{helpers} ext: %s', ext);
  return this.getEngine(ext).helpers;
};


/**
 * Get and set _generic_ helpers on the `cache`. Helpers registered
 * using this method will be passed to every engine, so be sure to use
 * generic javascript functions - unless you want to see Lo-Dash
 * blow up from `Handlebars.SafeString`.
 *
 * @param {String} `name` The helper to cache or get.
 * @param {Function} `fn` The helper function.
 * @param {Object} `thisArg` Context to bind to the helper.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Engine.prototype.addHelper = function(name, fn, thisArg) {
  debug.helper('#{adding helper} name: %s', name);
  return this._.helpers.addHelper(name, fn, thisArg);
};


/**
 * Async version of `.addHelper()`.
 *
 * @param {String} `name` The helper to cache or get.
 * @param {Function} `fn` The helper function.
 * @param {Object} `thisArg` Context to bind to the helper.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Engine.prototype.addHelperAsync = function(name, fn, thisArg) {
  debug.helper('#{adding async helper} name: %s', name);
  return this._.asyncHelpers.addHelperAsync(name, fn, thisArg);
};


/**
 * Keep an array of template sub-type for each template type, to
 * make it easier to get/set templates and pass them properly to
 * registered engines.
 *
 * @param {String} `plural` e.g. `pages`
 * @param {Object} `options`
 * @api private
 */

Engine.prototype.setType = function(plural, options) {
  debug.template('#{tracking type}: %s, %s', plural);
  var opts = extend({}, options);

  if (opts.isRenderable) {
    this.templateType.renderable.push(plural);
  }
  if (opts.isLayout) {
    this.templateType.layout.push(plural);
  }
  if (opts.isPartial || (!opts.isRenderable && !opts.isLayout)) {
    this.templateType.partial.push(plural);
    opts.isPartial = true;
  }

  return opts;
};


/**
 * Get all cached templates of the given `plural` type.
 *
 * ```js
 * var pages = template.getType('renderable');
 * //=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
 * ```
 *
 * @param {String} `plural`
 * @param {Object} `opts`
 * @api private
 */

Engine.prototype.getType = function(type) {
  var arr = this.templateType[type];
  return arr.reduce(function(acc, key) {
    acc[key] = this.cache[key];
    return acc;
  }.bind(this), {});
};


/**
 * Add a new template `sub-type`, along with associated get/set methods.
 * You must specify both the singular and plural names for the type.
 *
 * @param {String} `subtype` Singular name of the sub-type to create, e.g. `page`.
 * @param {String} `plural` Plural name of the template type, e.g. `pages`.
 * @param {Object} `options` Options for the template type.
 *   @option {Boolean} [options] `isRenderable` Is the template a partial view?
 *   @option {Boolean} [options] `layout` Can the template be used as a layout?
 *   @option {Boolean} [options] `partial` Can the template be used as a partial?
 * @return {Object} `Engine` to enable chaining.
 * @api public
 */

Engine.prototype.create = function(subtype, plural, options, fns) {
  debug.template('#{creating template subtype}: %s', subtype);
  var args = slice(arguments);

  if (typeof plural !== 'string') {
    fns = options;
    options = plural;
    // If you need more than this, just define the
    // plural name explicitly
    plural = subtype + 's';
  }

  if (typeof options === 'function') {
    fns = options;
    options = {};
  }

  this.cache[plural] = this.cache[plural] || {};
  options = this.setType(plural, options);

  // Add convenience methods for this sub-type
  this.decorate(subtype, plural, options, utils.filterMiddleware(fns, args));

  // Create a sync helper for this type
  if (!hasOwn(this._.helpers, subtype)) {
    this.typeHelpers(subtype, plural);
  }

  // Create an async helper for this type
  if (!hasOwn(this._.asyncHelpers, subtype)) {
    this.typeHelpersAsync(subtype, plural);
  }
  return this;
};


/**
 * Decorate a new template subtype with convenience methods.
 *
 * @param  {String} `subtype`
 * @param  {String} `plural`
 * @param  {Object} `options`
 * @api private
 */

Engine.prototype.decorate = function(subtype, plural, options, fns) {
  debug.template('#{decorating template subtype}:', subtype);
  options = extend({}, options);

  /**
   * Add a method to `Engine` for `subtype`
   */

  mixin(subtype, function (key, value, locals, opt) {
    this[plural].apply(this, arguments);
  });

  /**
   * Add a method to `Engine` for `plural`
   */

  mixin(plural, function (key, value, locals, opt) {
    this.load(plural, options, fns).apply(this, arguments);
  });

  /**
   * Add a `get` method to `Engine` for `subtype`
   */

  mixin(decorate.methodName('get', subtype), function (key) {
    return this.cache[plural][key];
  });

  /**
   * Add a `render` method to `Engine` for `subtype`
   */

  if (options.isRenderable) {
    mixin(decorate.methodName('render', subtype), function (key) {
      return this.renderType('renderable', subtype);
    });
  }

};


/**
 * Load templates and normalize them to an object with consistent
 * properties.
 *
 * See [load-templates] for more details.
 *
 * @param {String|Array|Object}
 * @return {Object}
 */

Engine.prototype.load = function(plural, options, fns) {
  debug.template('#{load} args:', arguments);

  var opts = extend({}, this.options, options);
  var loader = new Loader(opts);

  return function (key, value, locals) {
    var loaded = null;
    if (opts.loadFn) {
      loaded = opts.loadFn.apply(this, arguments);
    } else {
      loaded = loader.load.apply(loader, arguments);
    }

    var template = this.normalize(plural, loaded, options);

    // make sure all the templates go through the stack of middleware
    if (fns) {
      forOwn(template, function (value, key) {
        this.route(value.path).all(fns);
      }.bind(this));
    }

    extend(this.cache[plural], template);
    return this;
  };
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
 */

Engine.prototype.normalize = function(plural, template, options) {
  debug.template('#{normalize} args:', arguments);
  this.lazyrouter();

  if (this.option('normalize')) {
    return this.options.normalize.apply(this, arguments);
  }

  var renameKey = this.option('renameKey');

  forOwn(template, function (value, key) {
    value.options = extend({ type: plural }, options, value.options);
    key = renameKey.call(this, key);

    var ext = utils.pickExt(value, value.options, this);
    this.lazyLayouts(ext, value.options);

    var isLayout = utils.isLayout(value);
    utils.determineLayout(value);

    template[key] = value;

    if (isLayout) {
      this.layoutSettings[ext].setLayout(template);
    }
  }, this);
  return template;
};


/**
 * Temporarily cache a template that was passed directly to the [render]
 * method.
 *
 * See [load-templates] for details on template formatting.
 *
 * @param  {String|Object|Function} `key`
 * @param  {Object} `value`
 * @param  {Object} `locals`
 * @return {Object} Normalized template object.
 */

Engine.prototype.format = function(key, value, locals) {
  debug.template('#{format} args:', arguments);

  // Temporarily load a template onto the cache to normalize it.
  var load = this.load('anonymous', { isRenderable: true });
  load.apply(this, arguments);

  // Get the normalized template and return it.
  var template = this.cache['anonymous'][key];
  return this.stashLocals('render', template, locals);
};


/**
 * Get partials from the cache. More specifically, all templates with
 * a `templateType` of `partial` defined. If `options.mergePartials` is `true`,
 * this object will keep custom partial types seperate - otherwise, all
 * templates with the type `partials` will be merged onto the same object.
 * This is useful when necessary for the engine being used.
 *
 * @api private
 */

Engine.prototype.mergePartials = function(ext, locals, combine) {
  debug.template('#{merging partials} args:', arguments);

  combine = combine || this.option('mergePartials');
  var opts = extend({partials: {}}, locals);

  this.templateType['partial'].forEach(function (type) {
    forOwn(this.cache[type], function (value, key) {
      value.content = this.applyLayout(ext, value, value.locals);
      opts = extend({}, opts, value.locals);

      if (combine) {
        var fn = this.option('partialsKey');
        key = fn(key);

        opts.partials[key] = value.content;
      } else {
        opts[type][key] = value.content;
      }
    }.bind(this));
  }.bind(this));
  return opts;
};


/**
 * Preprocess `str` with the given `options` and `callback`. A few
 * things to note.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Engine.prototype.preprocess = function(template, locals, async) {
  if (typeof locals === 'boolean') {
    async = locals;
    locals = {};
  }

  locals = locals || {};

  var state = {};
  var engine = locals.engine;
  var delims = locals.delims;
  var content = template;
  var tmpl;
  var key;

  if (this.option('cache')) {
    tmpl = utils.getRenderable(template, this);
    if (!tmpl) {
      tmpl = utils.getPartial(template, this);
    }
  }

  if (tmpl) {
    template = tmpl;
    template = this.stashLocals('render', template, locals);
  } else {
    // generate a unique, temporary id
    template = this.format(utils.generateId(), template, locals);
  }

  // console.log(this);
  if (utils.isObject(template)) {
    content = template.content;
    locals = this.mergeFn(template, locals, async);
    delims = delims || utils.pickDelims(template, locals);

  } else {
    content = template;
  }

  // Get the extension to use for picking an engine
  var ext = utils.pickExt(template, locals, this);

  // if a layout is defined, wrap `content` with it
  content = this.applyLayout(ext, template, locals);

  // Ensure that `content` is a string.
  if (utils.isObject(content)) {
    content = content.content;
  }

  // Ensure that delimiters are cached, so we
  // can pass them to the engine
  if (Array.isArray(delims)) {
    this.addDelims(ext, delims);
  }


  if (utils.isString(engine)) {
    if (engine[0] !== '.') {
      engine = '.' + engine;
    }
    engine = this.getEngine(engine);
    delims = this.getDelims(engine);
  } else {
    engine = this.getEngine(ext);
    delims = this.getDelims(ext);
  }

  locals = extend({}, this.mergePartials(locals), locals, delims);

  // populate the state to pass back
  state.content = content;
  state.engine = engine;
  state.delims = delims;
  state.locals = locals;
  state.locals.path = template.path;
  return state;
};


/**
 * Render `content` with the given `options` and `callback`.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Engine.prototype.renderBase = function(engine, content, locals, cb) {
  var self = this;

  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  if (!hasOwn(engine, 'render')) {
    throw new Error('`.render()` method cannot be found on engine: "' + engine + '".');
  }

  try {
    engine.render(content, locals, function (err, res) {
      if (err) {
        console.log(chalk.red(err));
        cb.call(self, err);
        return;
      }

      self._.asyncHelpers.resolve(res, function (err, res) {
        if (err) return cb.call(self, err);
        cb.call(self, null, res);
      });
    });
  } catch (err) {
    console.log(chalk.red(err));
    cb.call(self, err);
  }
};


/**
 * Render the given string with the specified `locals` and `callback`.
 *
 * @param  {String} `str` The string to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Engine.prototype.renderType = function(type, subtype) {
  var self = this;

  return function(name, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var cache = self.getType(type);
    var template;
    if (subtype == null) {
      template = utils.firstOfType(name, self, type);
    } else {
      template = cache[subtype][name];
    }

    // The user-defined, default engine to use
    var viewEngine = self.option('viewEngine');
    var engine = self.getEngine(viewEngine);

    // Attempt to get the template from the cache.
    if (template == null) {
      throw new Error('Cannot find "' + name + '" on the cache.');
    }

    var content = template.content;
    locals = _.extend({}, template.locals, locals);

    if (Boolean(template.engine)) {
      engine = self.getEngine(template.engine);
    } else if (Boolean(template.ext)) {
      engine = self.getEngine(template.ext);
    }

    self.renderBase(engine, content, locals, cb);
  };
};


/**
 * Render `content` from the given cached template with the
 * given `locals` and `callback`.
 *
 * @param  {String} `name` Name of the cached template.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Engine.prototype.renderCached = function(name, locals, cb) {
  var self = this;

  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  // The user-defined, default engine to use
  var viewEngine = this.option('viewEngine');
  var engine = this.getEngine(viewEngine);

  // Attempt to get the template from the cache.
  var template = utils.firstOfType(name, this, ['renderable']);
  if (template == null) {
    throw new Error('Cannot find "' + name + '" on the cache.');
  }

  var content = template.content;
  locals = _.extend({}, template.locals, locals);


  if (Boolean(template.engine)) {
    engine = this.getEngine(template.engine);
  } else if (Boolean(template.ext)) {
    engine = this.getEngine(template.ext);
  }

  this.renderBase(engine, content, locals, cb);
};


/**
 * Render the given string with the specified `locals` and `callback`.
 *
 * @param  {String} `str` The string to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Engine.prototype.renderString = function(str, locals, cb) {
  var self = this;

  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  // The user-defined, default engine to use
  var viewEngine = this.option('viewEngine');
  var engine = this.getEngine(viewEngine);

  if (Boolean(locals.engine)) {
    engine = this.getEngine(locals.engine);
  } else if (Boolean(locals.ext)) {
    engine = this.getEngine(locals.ext);
  }

  this.renderBase(engine, str, locals, cb);
};


/**
 * Render `content` with the given `options` and `callback`.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Engine.prototype.render = function(content, locals, cb) {
  var self = this;

  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  var defaultExt = this.option('viewEngine');
  var engine = this.getEngine(defaultExt);

  if (self.option('preprocess')) {
    var pre = self.preprocess(content, locals, true);
    content = pre.content;
    locals = extend({}, pre.locals, locals);
    engine = pre.engine;
  }

  this.renderBase(engine, content, locals, cb);
};


/**
 * Render `content` with the given `locals`.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Engine.prototype.renderSync = function(content, locals) {
  var ext = this.option('viewEngine');
  var engine = this.getEngine(ext);

  if (this.option('preprocess')) {
    var pre = this.preprocess(content, locals);
    content = pre.content;
    locals = extend({}, pre.locals, locals);
    engine = pre.engine;
  }

  if (!hasOwn(engine, 'renderSync')) {
    throw new Error('`.renderSync()` method not found on engine: "' + engine + '".');
  }

  try {
    return engine.renderSync(content, locals);
  } catch (err) {
    console.log(chalk.red(err));
    return err;
  }
};


/**
 * Store a copy of a `locals` object at a given `location`.
 *
 * @param  {String} `name`
 * @param  {Object} `template`
 * @param  {Object} `locals`
 * @api private
 */

Engine.prototype.stashLocals = function(name, template, locals) {
  template._locals = template._locals || {};
  template._locals[name] = locals;
  return template;
};


/**
 * The default method used for merging data into the `locals` object
 * as a last step before its passed to the current renderer.
 *
 * @param  {Object} `template`
 * @param  {Object} `locals`
 * @return {Object}
 */

Engine.prototype.mergeFn = function(template, locals, async) {
  var data = this.get('data');
  var o = {};

  if (this.option('mergeFn')) {
    return this.option('mergeFn').apply(this, arguments);
  }

  if (utils.isObject(template)) {
    var preference = this.option('preferLocals');
    if (preference === true) {
      o = _.defaults({}, o, template.locals, template.data);
    } else {
      o = _.defaults({}, o, template.data, template.locals);
    }
  }

  o.helpers = extend({}, this._.helpers, (async
    ? this._.asyncHelpers
    : {}), o.helpers);

  return extend(data, o, locals);
};


/**
 * Extend the `Engine` prototype with a new method.
 *
 * @param  {String} `method` The method name.
 * @param  {Function} `fn`
 * @api private
 */

function mixin(method, fn) {
  Engine.prototype[method] = fn;
}


/**
 * Utility for getting an own property from an object.
 *
 * @param  {Object} `o`
 * @param  {Object} `prop`
 * @return {Boolean}
 * @api true
 */

function hasOwn(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
}
