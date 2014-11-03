/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

// process.env.DEBUG = 'template:*';

var _ = require('lodash');
var path = require('path');
var async = require('async');
var chalk = require('chalk');
var Delims = require('delims');
var forOwn = require('for-own');
var Layouts = require('layouts');
var routes = require('en-route');
var Cache = require('config-cache');
var Helpers = require('helper-cache');
var Engines = require('engine-cache');
var Loader = require('load-templates');
var engineLodash = require('engine-lodash');
var parserMatter = require('parser-front-matter');
var slice = require('array-slice');
var flatten = require('arr-flatten');

var camelize = require('./lib/utils/camelize');
var init = require('./lib/middleware/init');
var utils = require('./lib/utils');
var debug = require('./lib/debug');
var Router = routes.Router;
var Route = routes.Route;
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
  this.loaders = this.loaders || {};
  this.engines = this.engines || {};
  this.delims = this.delims || {};

  this._ = {};
  this.subtype = {};
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
  this.enable('default engines');
  this.enable('strict errors');
  this.enable('mergePartials', true);
  this.enable('cache');

  this.disable('preferLocals', false);

  this.option('cwd', process.cwd());
  this.option('ext', '*');
  this.option('destExt', '.html');
  this.option('defaultExts', ['md', 'html', 'hbs']);
  this.option('layoutDelims', ['{%', '%}']);
  this.option('delims', ['<%', '%>']);
  this.option('layoutTag', 'body');
  this.option('layoutExt', null);
  this.option('layout', null);
  this.option('viewEngine', '*');
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
 * Set the current working directory
 */

defineGetter(Template.prototype, 'cwd', function () {
  return this.option('cwd') || process.cwd();
});

/**
 * Load default routes / middleware
 *
 *   - `.md`: parse front matter in markdown files
 *   - `.hbs`: parse front matter in handlebars templates
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
  if (this.option('default engines')) {
    this.engine(this.option('defaultExts'), engineLodash, {
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
  debug.routes('handling: %s', file.path);

  if (!this.router) {
    debug.routes('no routes defined on engine');
    done();
    return;
  }

  this.router.handle(file, done);
};

/**
 * Dispatch `template` through a middleware `stack`.
 *
 * @param  {Object} `template`
 * @param  {Array} `fns`
 */

Template.prototype.dispatch = function(template, fns) {
  forOwn(template, function (value, key) {
    if (fns) this.route(value.path).all(fns);
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
 * If the `fn` parameter is an engine, then it will be
 * mounted at the `route` specified.
 *
 * @param {Function} `fn`
 * @api public
 */

Template.prototype.use = function (fn) {
  var offset = 0;
  var path = '/';

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
      return router.use(path, fn);
    }

    debug.routes('use: %s', path);
    fn.mountpath = path;
    fn.parent = this;
  }, this);
  return this;
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
 * Special-cased "all" method, applying the given route `path`,
 * middleware, and callback.
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

    debug.layout('lazy layouts: %s', ext);

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

Template.prototype.applyLayout = function(ext, value, locals) {
  debug.layout('applying layout [ext]: %s', ext);

  var layout = utils.determineLayout(value, locals, true);
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

  var obj = utils.pickContent(value);

  if (layoutEngine && !value.options.hasLayout) {
    debug.layout('applying layout: %j', layoutEngine);
    value.options.hasLayout = true;

    var opts = {};
    if (utils.isPartial(value)) {
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

  debug.delims('making delims: %j', arr);

  if (!Array.isArray(arr)) {
    return extend(options, this.getDelims('*'));
  }

  var delims = this._.delims.templates(arr, settings);
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
 * template.addDelims('es6', ['${', '}'], {
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

Template.prototype.addDelims = function(ext, arr, delims, settings) {
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  debug.delims('adding delims [ext]: %s', ext, arr);

  if (Array.isArray(delims)) {
    this.lazyLayouts(ext, {layoutDelims: delims}, settings || {});
  } else {
    settings = delims;
    delims = this.option('layoutDelims');
  }

  this.delims[ext] = extend({}, this.makeDelims(arr, settings), settings);
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
  debug.delims('using delims: %s', ext);

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
  debug.engine('registering [engine]: %s', ext);

  var opts = extend({}, options);
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

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
  debug.engine('engine %j:', exts);

  utils.arrayify(exts).forEach(function(ext) {
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }
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

  if (arguments.length === 1) {
    return this.cache.mixins[name];
  }

  this.cache.mixins[name] = fn;
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
 * @param {String} `name` The helper name
 * @param {Function} `fn` The helper function.
 * @api public
 */

Template.prototype.helper =
Template.prototype.addHelper = function(name, fn) {
  debug.helper('adding [helper]: %s', name);
  return this._.helpers.addHelper(name, fn);
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
 * template.helperAsync('lower', function(str, next) {
 *   str = str.toLowerCase();
 *   next();
 * });
 * ```
 *
 * @param {String} `ext` The engine to register helpers with.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.helperAsync =
Template.prototype.addHelperAsync = function(name, fn) {
  debug.helper('adding async helper: %s', name);
  return this._.asyncHelpers.addHelperAsync(name, fn);
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
  var self = this;
  this.helper(subtype, function (key, locals) {
    var content = self.renderSync(self.cache[plural][key], locals);
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

Template.prototype.defaultHelperAsync = function(subtype, plural) {
  var self = this;
  this.helperAsync(subtype, function (name, locals, next) {
    var last = arguments[arguments.length - 1];
    if (typeof locals === 'function') {
      next = locals;
      locals = {};
    }

    if (typeof next !== 'function') {
      next = last;
    }

    var partial = self.cache[plural][name];
    if (partial == null) {
      // TODO: use actual delimiters in messages
      var msg = chalk.red('helper {{' + subtype + ' "' + name + '"}} not found.');
      if (this.enabled('strict errors')) {
        throw new Error(msg);
      }
      console.log(msg);
      return next(null, '');
    }

    var locs = extend({}, partial.locals, partial.data, locals);
    var render = self.renderSubtype(subtype);

    render(name, locs, function (err, content) {
      if (err) return next(err);
      next(null, content);
      return;
    });
  });
};

/**
 * Private method for tracking the `subtypes` created for each
 * template type, to make it easier to get/set templates and
 * pass them properly to registered engines.
 *
 * @param {String} `plural` e.g. `pages`
 * @param {Object} `options`
 * @api private
 */

Template.prototype.setType = function(subtype, plural, options) {
  debug.template('setting [subtype]: %s', subtype);
  var opts = extend({}, options);

  // Make an association between `subtype` and its `plural`
  this.subtype[subtype] = plural;

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
 * Get all templates of the given `type`.
 *
 * ```js
 * var pages = template.getType('renderable');
 * //=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
 * ```
 *
 * See documentation for [types](./template-types)
 *
 * @param {String} `type`
 * @param {Object} `opts`
 * @api public
 */

Template.prototype.getType = function(type) {
  debug.template('getting [type]: %s', type);
  var arr = this.type[type];

  return arr.reduce(function(acc, plural) {
    acc[plural] = this.cache[plural];
    return acc;
  }.bind(this), {});
};

/**
 * Merge all templates from the given `type` into a single
 * object.
 *
 * If an array of `subtypes` is passed, only those `subtypes`
 * will be merged and the order in which the subtypes are defined
 * in the array will be respected.
 *
 * @param {String} `type` The template type to search.
 * @param {String} `subtypes` Optionally pass an array of subtypes
 * @api public
 */

Template.prototype.mergeType = function(type, subtypes) {
  debug.template('merging [type]: %s', type);
  var obj = this.getType(type);
  var keys = subtypes || Object.keys(obj);
  var len = keys.length;
  var o = {};
  var i = 0;

  while (len--) {
    var subtype = keys[i++];
    for (var key in this.cache[subtype]) {
      if (this.cache[subtype].hasOwnProperty(key)) {
        o[key] = this.cache[subtype][key];
      }
    }
  }
  return o;
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

Template.prototype.mergePartials = function(ext, locals, mergePartials) {
  debug.template('merging partials [%s]: %j', ext, arguments);
  var self = this;

  mergePartials = mergePartials || this.option('mergePartials');
  var opts = extend({partials: {}}, locals);

  self.type.partial.forEach(function (type) {
    forOwn(self.cache[type], function (value, key) {
      opts = extend({}, opts, value.locals);

      // If a layout is defined, apply it to the partial
      value.content = self.applyLayout(ext, value, value.locals);

      // If `mergePartials` is true combine all `partial` subtypes
      if (mergePartials === true) {
        opts.partials[key] = value.content;
      } else {
        opts[type][key] = value.content;
      }
    });
  });
  return opts;
};

/**
 * Search all `subtype` objects in the given `type`, returning
 * the first template found with the given `key`.
 *
 *   - If `key` is not found and `strict options` is enabled, an error will be thrown.
 *   - Optionally pass an array an array of `subtypes` to limit the search
 *
 * @param {String} `type` The template type to search.
 * @param {String} `key` The template to find.
 * @param {Array} `subtypes`
 * @api private
 */

Template.prototype._find = function(type, key, subtypes) {
  var o = this.mergeType(type, subtypes);

  if (o && utils.isObject(o) && hasOwn(o, key)) {
    return o[key];
  }

  if (this.enabled('strict errors')) {
    throw new Error('Cannot find ' + type + ' template: "' + key + '"');
  }
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
  return this._find('layout', key, subtypes);
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
  return this._find('partial', key, subtypes);
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
  return this._find('renderable', key, subtypes);
};

/**
 * Convenience method for finding a template on the cache,
 * with or without a file extension.
 *
 * @param {String} `plural` The template cache to search.
 * @param {String} `name` The name of the template.
 * @api public
 */

Template.prototype.lookup = function(plural, name, ext) {
  var cache = this.cache[plural];
  if (hasOwn(cache, name)) {
    return cache[name];
  }
  if (hasOwn(cache, name + ext || '.md')) {
    return cache[name + ext || '.md'];
  }

  if (this.enabled('strict errors')) {
    throw new Error('Cannot find ' + plural + ': "' + name + '"');
  }
};

/**
 * Define a custom loader for loading templates.
 *
 * @param  {String} `plural`
 * @param  {Object} `options`
 * @param  {Array} `fns`
 * @param  {Function} `done`
 */

Template.prototype.loader = function (plural, options, fns, done) {
  var self = this;

  if (arguments.length !== 1) {
    if (typeof options === 'function' || Array.isArray(options)) {
      fns = options;
      options = {};
    }

    var stack = utils.arrayify(fns);
    done = done || function () {};

    self.loaders[plural] = function(key, value, fns, callback) {
      if (typeof key === 'object') {
        callback = fns;
        fns = value;
        value = key;
        key = null;
      }
      if (Array.isArray(value)) {
        callback = fns;
        fns = value;
        value = null;
      }
      if (typeof value === 'function') {
        callback = value;
        fns = [];
        value = null;
      }
      if (typeof fns === 'function') {
        callback = fns;
        fns = [];
      }

      if (typeof callback !== 'function') {
        throw new Error('Template#loader() expects `callback` to be a function.');
      }
      if (!Array.isArray(fns)) {
        throw new Error('Template#loader() expects `fns` to be an array.');
      }

      // find our stack to call
      var results = {};
      var loaderStack = stack.concat(fns);

      // if no custom loader is defined, fallback to [jonschlinkert/load-templates]
      if (loaderStack.length === 0) {
        var loader = new Loader(options);
        results = loader.load.call(loader, key, value);
        return callback(null, self.normalize(plural, results, options));
      }

      // pass the loaderStack through the waterfall to get the templates
      var first = loaderStack[0];

      loaderStack[0] = function (next) {
        if (key && value) {
          return first.call(self, key, value, next);
        }
        if (key) {
          return first.call(self, key, next);
        }
        if (value) {
          return first.call(self, value, next);
        }
        next(new Error('No valid arguments'));
      };

      async.waterfall(loaderStack, function (err, template) {
        var override = done(err, template);
        results = override || template;
        callback(err, results);
      });

    };
  }
  return self.loaders[plural];
};

/**
 * Default load function used for loading templates.
 *
 * @param  {String} `plural`
 * @param  {Object} `options`
 * @param  {Array} `fns`
 * @param  {Function} `done`
 */

Template.prototype.load = function(plural, options, fns, done) {
  debug.template('loading: %j', arguments);

  var opts = extend({}, options);
  var self = this;

  var loader = function () {
    if (opts.loadFn) {
      var callback = arguments[arguments.length - 1];
      var args = slice(arguments, 0, arguments.length - 1);
      callback(null, opts.loadFn.apply(self, arguments));
    } else {
      self.loader(plural, opts, fns, done).apply(self, arguments);
    }
  };

  return function (/*key, value, fns*/) {
    var args = slice(arguments);
    var last = args[args.length - 1];
    var callback = function () {};

    if (typeof last === 'function') {
      callback = args.pop();
    }

    args = args.concat([function (err, loaded) {
      if (err) return callback(err);
      self.dispatch(loaded);
      extend(self.cache[plural], loaded);
      callback(null);
    }]);

    loader.apply(self, args);
    return self;
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

Template.prototype.format = function(key, value, locals, options) {
  debug.template('formatting [%s]: %j', key, value);

  // Temporarily load a template onto the cache to normalize it.
  var load = this.load('anonymous', { isRenderable: true });
  load.apply(this, arguments);

  // Get the normalized template and return it.
  return this.cache['anonymous'][key];
};

/**
 * Add a new template `sub-type`, along with associated get/set methods.
 *
 * When you only specify a name for the type, a plural form is created
 * automatically (e.g. `page` and `pages`). However, you can define the
 * `plural` form explicitly if necessary.
 *
 * @param {String} `subtype` Singular name of the sub-type to create, e.g. `page`.
 * @param {String} `plural` Plural name of the template type, e.g. `pages`.
 * @param {Object} `options` Options for the template type.
 *   @option {Boolean} [options] `isRenderable` Templates that may be rendered at some point
 *   @option {Boolean} [options] `isLayout` Templates to be used as layouts
 *   @option {Boolean} [options] `isPartial` Templates to be used as partial views or includes
 * @param {Function|Array} `fns` Middleware function or functions to be run for every template of this type.
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.create = function(subtype, plural, options, fns, done) {
  debug.template('#{creating template subtype}: %s', subtype);
  var args = slice(arguments);

  if (typeof plural !== 'string') {
    done = fns;
    fns = options;
    options = plural;
    plural = subtype + 's';
  }

  if (typeof options === 'function') {
    done = options;
    fns = [];
    options = {};
  }

  if (Array.isArray(options)) {
    done = fns;
    fns = options;
    options = {};
  }

  debug.template('creating subtype: [%s / %s]', subtype, plural);

  if (typeof fns === 'function') {
    done = fns;
    fns = [];
  }

  this.cache[plural] = this.cache[plural] || {};
  options = this.setType(subtype, plural, options);

  // Add convenience methods for this sub-type
  this.decorate(subtype, plural, options, fns, done);

  // Create a sync helper for this type
  if (!hasOwn(this._.helpers, subtype)) {
    this.defaultHelper(subtype, plural);
  }

  // Create an async helper for this type
  if (!hasOwn(this._.asyncHelpers, subtype)) {
    this.defaultHelperAsync(subtype, plural);
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

Template.prototype.decorate = function(subtype, plural, options, fns, done) {
  debug.template('decorating subtype: [%s / %s]', subtype, plural);
  options = extend({}, options);

  /**
   * Middleware for this template type
   */

  utils.filterMiddleware(fns, slice(arguments));

  /**
   * Add a method to `Template` for `plural`
   */

  var load = this.load(plural, options, fns, done);
  mixin(plural, function (/*key, value, fns*/) {
    return load.apply(this, arguments);
  });

  /**
   * Add a method to `Template` for `subtype`
   */

  mixin(subtype, function (/*key, value, locals, opts*/) {
    return this[plural].apply(this, arguments);
  });

  /**
   * Add a `get` method to `Template` for `subtype`
   */

  mixin(methodName('get', subtype), function (key) {
    return this.cache[plural][key];
  });

  /**
   * Add a `render` method to `Template` for `subtype`
   */

  mixin(methodName('render', subtype), function () {
    return this.renderSubtype(subtype);
  });
};

/**
 * Validate a template object to ensure that it has the properties
 * expected for applying layouts, and for choosing engines and
 * renderers. Validation is used by default, but you can choose to
 * bypass.
 *
 * @param  {String} `key` Template key
 * @param  {Object} `value` Template object
 * @api public
 */

Template.prototype.validate = function(key, value) {
  if (key == null || typeof key !== 'string') {
    throw new Error('template `key` must be a string.');
  }

  if (value == null || !utils.isObject(value)) {
    throw new Error('template `value` must be an object.');
  }

  if (!hasOwn(value, 'path')) {
    throw new Error('template `value` must have a `path` property.');
  }

  if (!hasOwn(value, 'content')) {
    throw new Error('template `value` must have a `content` property.');
  }
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
  debug.render('renderBase: %j', engine);
  var self = this;

  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  if (!hasOwn(engine, 'render')) {
    throw new Error('`.render()` method not found on: "' + engine.name + '".');
  }

  try {
    engine.render(content, locals, function (err, res) {
      if (err) {
        debug.render('renderBase: %j', err);
        cb.call(self, err);
        return;
      }

      self._.asyncHelpers.resolve(res, function (err, res) {
        if (err) {
          debug.err('renderBase [async helpers]: %j', err);
          return cb.call(self, err);
        }
        cb.call(self, null, res);
      });
    });
  } catch (err) {
    debug.err('renderBase [catch]: %j', err);
    cb.call(self, err);
  }
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
  debug.render('rendering: %s', content);

  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  locals = extend({}, locals);

  var ext = locals.engine || locals.ext || this.option('viewEngine');
  var engine = this.getEngine(ext);

  // Bind context to helpers
  this.bindHelpers(locals);

  // Apply layout before rendering
  content = this.applyLayout(ext, {content: content}, locals);
  this.renderBase(engine, content, locals, cb);
};

/**
 * Render `content` from the given cached template with the
 * given `locals` and `callback`.
 *
 * @param  {String} `key` Name of the cached template.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderCached = function(key, locals, cb) {
  debug.render('rendering cached: %s', key);
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  // Return the first matching template from a `renderable` subtype
  var template = this.findRenderable(key);
  if (template == null) {
    throw new Error('Cannot find "' + key + '" on the cache.');
  }


  // Merge `.render()` locals with template locals
  locals = extend({}, locals, this.cache.data, template.locals, template.data);

  var ext = template.engine
    || template.ext
    || locals.engine
    || locals.ext
    || path.extname(template.path)
    || this.option('viewEngine');

  var engine = this.getEngine(ext);

  // Bind context to helpers before passing to the engine.
  this.bindHelpers(locals);
  // this.bindHelpers(engine);

  // if a layout is defined, apply it before rendering
  var content = this.applyLayout(ext, template, locals);
  this.renderBase(engine, template.content, locals, cb);
};

/**
 * Lookup a template by `name` on the given `subtype`, then render
 * its content with the engine specified for the template.
 *
 * @param  {String} `str` The string to render.
 * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderSubtype = function(subtype) {
  var self = this;
  var plural = this.subtype[subtype];
  return function (key, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    // Return the first matching template from a `renderable` subtype
    var template = self.lookup(plural, key);
    if (template == null) {
      throw new Error('Cannot find "' + key + '" on the cache.');
    }


    // Merge `.render()` locals with template locals
    locals = extend({}, locals, self.cache.data, template.locals, template.data);

    var ext = template.engine
      || template.ext
      || locals.engine
      || locals.ext
      || path.extname(template.path)
      || self.option('viewEngine');

    var engine = self.getEngine(ext);

    // Bind context to helpers before passing to the engine.
    self.bindHelpers(locals);
    // self.bindHelpers(engine);

    // if a layout is defined, apply it before rendering
    var content = self.applyLayout(ext, template, locals);
    self.renderBase(engine, template.content, locals, cb);
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
  debug.render('rendering type: [%s / %s]', type, subtype);
  var self = this;

  return function(name, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var obj = self.getType(type);
    var template;
    if (subtype == null) {
      template = utils.firstOfType(name, self, type);
    } else {
      template = obj[subtype][name];
    }

    // The user-defined, default engine to use
    var ext = self.option('viewEngine');
    var engine = self.getEngine(ext);

    // Attempt to get the template from the cache.
    if (template == null) {
      throw new Error('Cannot find template: "' + name + '".');
    }

    var content = template.content;
    locals = self.mergeLocals(self, template, locals);

    if (Boolean(template.engine)) {
      engine = self.getEngine(template.engine);
    } else if (Boolean(template.ext)) {
      engine = self.getEngine(template.ext);
    }

    self.renderBase(engine, content, locals, cb);
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

Template.prototype.renderString = function(str, locals, cb) {
  debug.render('render string: %s', str);

  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  // The user-defined, default engine to use
  var ext = this.option('viewEngine');
  var engine = this.getEngine(ext);

  if (Boolean(locals.engine)) {
    engine = this.getEngine(locals.engine);
  } else if (Boolean(locals.ext)) {
    engine = this.getEngine(locals.ext);
  }

  this.renderBase(engine, str, locals, cb);
};

/**
 * Render `content` with the given `locals`.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderFile = function(filepath, locals, cb) {
  debug.render('rendering file: %s', filepath);

  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  // var str = fs.readFileSync(filepath, 'utf8');
  // this.renderBase(engine, str, locals, cb);
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
  debug.render('render sync: %s', content);

  var ext = this.option('viewEngine');
  var engine = this.getEngine(ext);

  if (!hasOwn(engine, 'renderSync')) {
    throw new Error('`.renderSync()` method not found on engine: "' + engine + '".');
  }

  try {
    return engine.renderSync(content, locals);
  } catch (err) {
    debug.err('renderSync: %j', err);
    return err;
  }
};

/**
 * Bind the current context to helpers.
 *
 * @param  {Object} `locals`
 * @return {Object}
 */

Template.prototype.bindHelpers = function (locals, sync) {
  debug.helper('binding helpers: %j', locals);

  // TODO: use or merge in locals.helpers instead
  var helpers = _.cloneDeep(sync
      ? this._.helpers
      : this._.asyncHelpers);

  locals.helpers = {};

  var o = {};
  o.context = locals;
  o.root = this;

  forOwn(helpers, function(fn, key) {
    locals.helpers[key] = _.bind(fn, o);
  });
};

/**
 * Merge locals with `cache.data`.
 *
 * @param  {String} `name`
 * @param  {Object} `template`
 * @param  {Object} `locals`
 * @api private
 */

Template.prototype.mergeLocals = function(self, template, locals, delims) {
  locals = extend({}, self.cache.data, template.locals, locals);
  return extend({}, self.mergePartials(locals), locals, delims);
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
  debug.template('merge function: %j', template);
  var data = this.get('data');
  var o = {};

  if (this.option('mergeFn')) {
    return this.option('mergeFn').apply(this, arguments);
  }

  if (utils.isObject(template)) {
    o = this.enabled('preferLocals')
      ? _.defaults({}, o, template.locals, template.data)
      : _.defaults({}, o, template.data, template.locals);
  }

  o.helpers = extend({}, this._.helpers, (async
    ? this._.asyncHelpers
    : {}), o.helpers);

  return extend(data, o, locals);
};

/**
 * Create a camel-cased method name for the given
 * `method` and `type`.
 *
 *     'get' + 'page' => `getPage`
 *
 * @param  {String} `type`
 * @param  {String} `name`
 * @return {String}
 */

function methodName(method, type) {
  return camelize(method) + type[0].toUpperCase() + type.slice(1);
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