/*!
 * template <https://github.com/jonschlinkert/template>
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
var routes = require('en-route');
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

var Router = routes.Router;
var Route = routes.Route;
var init = require('./lib/middleware/init');
var decorate = require('./lib/decorate');
var utils = require('./lib/utils');
var debug = require('./lib/debug');
var extend = _.extend;


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

var Template = module.exports = Cache.extend({
  constructor: function(options) {
    Template.__super__.constructor.call(this, options);
    this.initTemplate();
  }
});

/**
 * Extend `Template`
 */

Template.extend = Cache.extend;
Template.Router = Router;
Template.Route = Route;

/**
 * Initialize defaults.
 *
 * @api private
 */

Template.prototype.initTemplate = function() {
  this.engines = this.engines || {};
  this.delims = this.delims || {};

  this._ = {};
  this.subtypes = {};
  this.type = {};
  this.type.partial = [];
  this.type.renderable = [];
  this.type.layout = [];
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

Template.prototype.defaultConfig = function() {
  this._.delims = new Delims(this.options);
  this._.engines = new Engines(this.engines);
  this._.helpers = new Helpers({bindFunctions: false});
  this._.asyncHelpers = new Helpers({bindFunctions: false});

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

Template.prototype.defaultOptions = function() {
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
  this.option('built-in:engines', true);
  this.option('preprocess', true);
  this.option('preferLocals', false);
  this.option('partialLayout', null);
  this.option('mergePartials', true);
  this.option('mergeFunction', extend);

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

Template.prototype.defaultRoutes = function() {
  this.route(/\.(md|hbs)$/).all(function route(file, next) {
    parserMatter.parse(file, function(err) {
      if (err) return next(err);
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

Template.prototype.defaultEngines = function() {
  if (this.option('built-in:engines')) {
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

Template.prototype.defaultDelimiters = function() {
  this.addDelims('*', ['<%', '%>'], ['{%', '%}']);
};

/**
 * Register default template types.
 *
 * @api private
 */

Template.prototype.defaultTemplates = function() {
  this.create('page', { isRenderable: true });
  this.create('layout', { isLayout: true });
  this.create('partial', { isPartial: true });
};

/**
 * Lazily initalize router, to allow options to
 * be passed in after init.
 *
 * @api private
 */

Template.prototype.lazyrouter = function() {
  if (!this.router) {
    this.router = new Router({
      caseSensitive: this.enabled('case sensitive routing'),
      strict: this.enabled('strict routing')
    });
    this.router.use(init(this));
  }
};

/**
 * Dispatch `file` through a middleware stack
 *
 * @param  {Object} `file` File object to be passed through the middleware stack
 * @api private
 */

Template.prototype.handle = function(file, done) {
  debug.routes('#routes:handle', file);
  if (!this.router) {
    debug('no routes defined on engine');
    done();
    return;
  }
  this.router.handle(file, done);
};

/**
 * Dispatch `template` through a middleware `stack`.
 *
 * @param  {Object} `template`
 * @param  {Array} `stack`
 */

Template.prototype.handleTemplate = function(template, stack) {
  forOwn(template, function (value, key) {
    if (stack) {
      this.route(value.path).all(stack);
    }
    this.handle(value, function (err) {
      if (err) {
        console.log(chalk.red('Error running middleware for', key));
        console.log(chalk.red(err));
      }
    });
  }.bind(this));
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

Template.prototype.use = function (fn) {
  var offset = 0;
  var path = '/';

  // default path to '/', disambiguate `engine.use([fn])`
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

Template.prototype.route = function(path){
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
 * @return {Object} `Template` for chaining
 * @api public
 */

Template.prototype.param = function(name, fn){
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
 * @param {Function} Callback
 * @return {Object} `Template` for chaining
 * @api public
 */

Template.prototype.all = function(path){
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

Template.prototype.lazyLayouts = function(ext, options) {
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

Template.prototype.applyLayout = function(ext, template, locals) {
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
 * template.addDelims('curly', ['{%', '%}']);
 * template.addDelims('angle', ['<%', '%>']);
 * template.addDelims('es6', ['#{', '}'], {
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

Template.prototype.addDelims = function(ext, arr, layoutDelims, settings) {
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

Template.prototype.getDelims = function(ext) {
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
 * template.useDelims('curly');
 * template.useDelims('angle');
 * ```
 *
 * @param {String} `ext`
 * @api public
 */

Template.prototype.useDelims = function(ext) {
  debug.delims('#{using delims} ext: %s', ext);
  if (ext && ext[0] !== '.') {
    ext = '.' + ext;
  }
  return this.currentDelims = ext;
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
  var opts = extend({}, options);
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  debug.engine('#{register} args:', arguments);
  debug.engine('#{register} ext: %s', ext);

  this._.engines.setEngine(ext, fn, opts);
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
 * @param {String|Array} `exts` File extension or array of extensions.
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Object} `Template` to enable chaining
 * @api public
 */

Template.prototype.engine = function(exts, fn, options) {
  debug.engine('#{engine} args: ', arguments);

  utils.arrayify(exts).forEach(function(ext) {
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }
    this.registerEngine(ext, fn, options);
  }.bind(this));
  return this;
};

/**
 * Get the engine object registered for the given `ext`. If no
 * `ext` is passed, the entire cache is returned.
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
  debug.engine('#{getEngine} ext: %s', ext);
  var engine = this._.engines.getEngine(ext);
  engine.options.thisArg = null;
  return engine;
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

Template.prototype.addMixin = function(name, fn) {
  if (arguments.length === 1) {
    return this.cache.mixins[name];
  }
  this.cache.mixins[name] = fn;
  return this;
};

/**
 * Get and set _generic_ helpers on the `cache`.
 *
 * Helpers registered
 * using this method will be passed to every engine, so be sure to use
 * generic javascript functions - unless you want to see Lo-Dash
 * blow up from `Handlebars.SafeString`.
 *
 * @param {String} `name` The helper to cache or get.
 * @param {Function} `fn` The helper function.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.addHelper = function(name, fn) {
  debug.helper('#{adding helper} name: %s', name);
  return this._.helpers.addHelper(name, fn);
};

/**
 * Register a helper for the given `ext` (engine). Register the given view engine callback `fn` as `ext`. If only `ext`
 * is passed, the engine registered for `ext` is returned. If no `ext`
 * is passed, the entire cache is returned.
 *
 * ```js
 * template.helper('lower', function(str) {
 *   return str.toLowerCase();
 * });
 * ```
 *
 * @param {String} `ext` The engine to register helpers with.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.helper = function() {
  debug.helper('#{helper}: %j', arguments);
  return this.addHelper.apply(this, arguments);
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

Template.prototype.helpers = function(ext) {
  debug.helper('#{helpers} ext: %s', ext);
  return this.getEngine(ext).helpers;
};

/**
 * Async version of `.addHelper()`.
 *
 * @param {String} `name` The helper to cache or get.
 * @param {Function} `fn` The helper function.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.addHelperAsync = function(name, fn) {
  debug.helper('#{adding async helper} name: %s', name);
  return this._.asyncHelpers.addHelperAsync(name, fn);
};

/**
 * Register a helper for the given `ext` (engine).
 *
 * ```js
 * template.helperAsync('lower', function(str) {
 *   return str.toLowerCase();
 * });
 * ```
 *
 * @param {String} `ext` The engine to register helpers with.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.helperAsync = function() {
  debug.helper('#{helper}: %j', arguments);
  return this.addHelperAsync.apply(this, arguments);
};

/**
 * Create helpers for each default template `type`.
 *
 * @api private
 */

Template.prototype.createTypeHelper = function(type, plural) {
  var self = this;

  this.helper(type, function (key, locals) {
    var partial = self.cache[plural][key];

    partial = self.stashLocals('typeHelper', partial, locals);

    var content = self.renderSync(partial, locals);
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

Template.prototype.createTypeHelperAsync = function(subtype, plural) {
  var template = this;

  this.helperAsync(subtype, function (name, locals, next) {
    var last = _.last(arguments);

    if (typeof locals === 'function') {
      next = locals;
      locals = {};
    }
    if (typeof next !== 'function') {
      next = last;
    }

    var partial = template.cache[plural][name];
    if (partial == null) {
      console.log(chalk.red('helper {{' + subtype + ' "' + name + '"}} not found.'));
      return next(null, '');
    }

    var loc = extend({}, partial.locals, partial.data, locals);
    var render = template.renderSubtype(subtype);

    render(name, loc, function (err, content) {
      if (err) return next(err);
      next(null, content);
      return;
    });
  });
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

Template.prototype.setType = function(subtype, plural, options) {
  debug.template('#{tracking type}: %s, %s', plural);
  var opts = extend({}, options);

  // Make an association between `subtype` and its `plural`
  this.subtypes[subtype] = plural;

  // Track the new template subtype by its parent `type`
  if (opts.isRenderable) {
    this.type.renderable.push(plural);
  }
  if (opts.isLayout) {
    this.type.layout.push(plural);
  }
  // if it's not renderable or a layout, assume it's a partial
  if (opts.isPartial || (!opts.isRenderable && !opts.isLayout)) {
    this.type.partial.push(plural);
    opts.isPartial = true;
  }
  return opts;
};

/**
 * Get all cached templates of the given `type`. Types are:
 *
 *   - `renderable`: Templates that may be rendered at some point
 *   - `layout`: Templates to be used as layouts
 *   - `partial`: Templates to be used as partial views or includes
 *
 * ```js
 * var pages = template.getType('renderable');
 * //=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
 * ```
 *
 * @param {String} `type`
 * @param {Object} `opts`
 * @api public
 */

Template.prototype.getType = function(type) {
  var arr = this.type[type];
  var template = this;

  return arr.reduce(function(acc, subtype) {
    acc[subtype] = template.cache[subtype];
    return acc;
  }, {});
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

Template.prototype.load = function(plural, options, fns) {
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

    // Handle middleware
    this.handleTemplate(template, fns);

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

Template.prototype.normalize = function(plural, template, options) {
  debug.template('#{normalize} args:', arguments);
  this.lazyrouter();

  if (this.option('normalize')) {
    return this.options.normalize.apply(this, arguments);
  }

  forOwn(template, function (value, key) {
    value.options = extend({ subtype: plural }, options, value.options);

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

Template.prototype.format = function(key, value, locals) {
  debug.template('#{format} args:', arguments);

  // Temporarily load a template onto the cache to normalize it.
  var load = this.load('anonymous', { isRenderable: true });
  load.apply(this, arguments);

  // Get the normalized template and return it.
  var template = this.cache['anonymous'][key];
  return this.stashLocals('render', template, locals);
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
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.create = function(subtype, plural, options, fns) {
  debug.template('#{creating template subtype}: %s', subtype);
  var args = slice(arguments);

  // If you need more than the following just define
  // `plural` explicitly
  if (typeof plural !== 'string') {
    fns = options;
    options = plural;
    plural = subtype + 's';
  }

  if (typeof options === 'function') {
    fns = options;
    options = {};
  }

  this.cache[plural] = this.cache[plural] || {};
  options = this.setType(subtype, plural, options);

  // Add convenience methods for this sub-type
  this.decorate(subtype, plural, options, utils.filterMiddleware(fns, args));

  // Create a sync helper for this type
  if (!hasOwn(this._.helpers, subtype)) {
    this.createTypeHelper(subtype, plural);
  }

  // Create an async helper for this type
  if (!hasOwn(this._.asyncHelpers, subtype)) {
    this.createTypeHelperAsync(subtype, plural);
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

Template.prototype.decorate = function(subtype, plural, options, fns) {
  debug.template('#{decorating template subtype}:', subtype);
  options = extend({}, options);

  /**
   * Add a method to `Template` for `subtype`
   */

  mixin(subtype, function (key, value, locals, opt) {
    this[plural].apply(this, arguments);
  });

  /**
   * Add a method to `Template` for `plural`
   */

  mixin(plural, function (key, value, locals, opt) {
    this.load(plural, options, fns).apply(this, arguments);
  });

  /**
   * Add a `get` method to `Template` for `subtype`
   */

  mixin(decorate.methodName('get', subtype), function (key) {
    return this.cache[plural][key];
  });

  /**
   * Add a `render` method to `Template` for `subtype`
   */

  mixin(decorate.methodName('render', subtype), function () {
    return this.renderSubtype(subtype);
  });

  /**
   * Add a `handle` method for a template subtype
   */

  mixin(decorate.methodName('handle', subtype), function () {
    return this.renderSubtype(subtype);
  });
};

/**
 * Get partials from the cache. More specifically, all templates with
 * a `type` of `partial` defined. If `options.mergePartials` is `true`,
 * this object will keep custom partial types seperate - otherwise, all
 * templates with the type `partials` will be merged onto the same object.
 * This is useful when necessary for the engine being used.
 *
 * @api private
 */

Template.prototype.mergePartials = function(ext, locals, combine) {
  debug.template('#{merging partials} args:', arguments);

  combine = combine || this.option('mergePartials');
  var opts = extend({partials: {}}, locals);

  this.type['partial'].forEach(function (type) {
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

Template.prototype.preprocess = function(template, locals, async) {
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

Template.prototype.renderBase = function(engine, content, locals, cb) {
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

Template.prototype.renderType = function(type, subtype) {
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
 * Create a `.render()` method for the given `subtype`.
 *
 * The created method has takes the same parameters as the default
 * `.render()` method, accept that the first parameter expects the
 * name of a cached template, rather than any given string.
 *
 * @param  {String} `str` The string to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderSubtype = function(subtype) {
  var self = this;

  return function(name, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    // Get the plural name of the cache to use
    var plural = self.subtypes[subtype];
    var template = self.cache[plural][name];

    // The user-defined, default engine to use
    var viewEngine = self.option('viewEngine');
    var engine = self.getEngine(viewEngine);

    // Attempt to get the template from the cache.
    if (template == null) {
      throw new Error('Cannot find "' + name + '" on the cache.');
    }

    locals = _.extend({}, self.cache.data, template.locals, locals);

    if (Boolean(template.engine)) {
      engine = self.getEngine(template.engine);
    } else if (Boolean(template.ext)) {
      engine = self.getEngine(template.ext);
    }

    // // Get the extension to use for picking an engine
    var ext = utils.pickExt(template, locals, self);

    // if a layout is defined, wrap `content` with it
    var content = self.applyLayout(ext, template, locals);

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

Template.prototype.renderCached = function(name, locals, cb) {
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

Template.prototype.renderString = function(str, locals, cb) {
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

Template.prototype.render = function(content, locals, cb) {
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  var defaultExt = this.option('viewEngine');
  var engine = this.getEngine(defaultExt);

  if (this.option('preprocess')) {
    var pre = this.preprocess(content, locals, true);
    content = pre.content;
    locals = extend({}, pre.locals, locals);
    engine = pre.engine;
  }

  var o = {};
  var helpers = _.cloneDeep(locals.helpers);
  o.root = this;
  o.context = locals;

  locals.helpers = {};

  _.forIn(helpers, function(fn, key) {
    locals.helpers[key] = _.bind(fn, o);
  });

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

Template.prototype.renderSync = function(content, locals) {
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

Template.prototype.stashLocals = function(name, template, locals) {
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

Template.prototype.mergeFn = function(template, locals, async) {
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
 * @param  {Object} `obj`
 * @param  {String} `name`
 * @param  {Function} `getter`
 * @return {Getter}
 * @api private
 */

function defineGetter(obj, name, getter) {
  Object.defineProperty(obj, name, {
    configurable: false,
    enumerable: false,
    get: getter,
    set: function() {}
  });
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
