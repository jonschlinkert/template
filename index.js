/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

// process.env.DEBUG = 'template:template';

var _ = require('lodash');
var path = require('path');
var chalk = require('chalk');
var forOwn = require('for-own');
var id = require('uniqueid');
var Cache = require('config-cache');
var Router = require('en-route');
var Engines = require('engine-cache');
var Helpers = require('helper-cache');
var Loader = require('load-templates');
var Layouts = require('layouts');
var Delims = require('delims');
var matter = require('parser-front-matter');
var noop = require('parser-noop');
var utils = require('./lib/utils');
var debug = require('./lib/debug');
var extend = _.extend;
var hasOwn = utils.hasOwn;


/**
 * Create a new instance of `Template`, optionally passing the default
 * `context` and `options` to use.
 *
 * **Example:**
 *
 * ```js
 * var Template = require('template');
 * var template = new Template();
 * ```
 *
 * @class `Template`
 * @param {Object} `context` Context object to start with.
 * @param {Object} `options` Options to use.
 * @api public
 */

var Template = module.exports = Cache.extend({
  constructor: function (options) {
    Template.__super__.constructor.call(this, options);
    this.init();
  }
});

Template.extend = Cache.extend;


/**
 * Initialize defaults.
 *
 * @api private
 */

Template.prototype.init = function() {
  this.engines = this.engines || {};
  this.delims = this.delims || {};
  this._stack = [];

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
 * Initialize default cache configuration.
 *
 * @api private
 */

Template.prototype.defaultConfig = function() {
  this._.delims = new Delims(this.options);
  this._.engines = new Engines(this.engines);
  this._.helpers = new Helpers({
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

Template.prototype.defaultOptions = function() {
  this.option('cache', true);
  this.option('strictErrors', true);
  this.option('pretty', false);

  this.option('cwd', process.cwd());
  this.option('ext', '*');
  this.option('defaultExts', ['md', 'html', 'hbs']);
  this.option('destExt', '.html');
  this.option('delims', {});
  this.option('viewEngine', '.*');
  this.option('engineDelims', null);
  this.option('layoutTag', 'body');
  this.option('layoutDelims', ['{%', '%}']);
  this.option('layout', null);

  this.option('preprocess', true);
  this.option('preferLocals', false);
  this.option('partialLayout', null);
  this.option('mergePartials', true);
  this.option('mergeFunction', extend);
  this.option('bindHelpers', true);

  // loader options
  this.option('renameKey', function (filepath) {
    return path.basename(filepath);
  });
};


/**
 * Load default middleware
 *
 * @api private
 */

Template.prototype.defaultRoutes = function() {
  this.route(/\.(?:md|hbs)$/, function (value, key, next) {
    matter.parse(value, function (err) {
      if (err) return next(err);
      next();
    });
  });

  this.route(/.*/, function (value, key, next) {
    noop.parse(value, function (err) {
      if (err) return next(err);
      next();
    });
  });
};


/**
 * Load default engines.
 *
 *   - `*` The noop engine is used as a pass-through when no other engine matches.
 *   - `md` Used to process Lo-Dash templates in markdown files.
 *
 * @api private
 */

Template.prototype.defaultEngines = function() {
  var exts = this.option('defaultExts');
  this.engine(exts, require('engine-lodash'), {
    layoutDelims: ['{%', '%}'],
    destExt: '.html'
  });
  this.engine('*', require('engine-noop'), {
    layoutDelims: ['{%', '%}'],
    destExt: '.html'
  });
};


/**
 * Register default template delimiters.
 *
 *    - engine delimiters
 *    - layout delimiters
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
  this.create('partial');
};


/**
 * Utilize the given middleware `fn` to the given `filepath`, defaulting to `_/_`.
 *
 * **Examples:**
 *
 * ```js
 * site.use(template.prettyURLs());
 * ```
 *
 * @param {String|Function} `filepath`
 * @param {Function} fn
 * @return {Object} `Template` for chaining
 * @api public
 */

// Template.prototype.use = function(filepath, fn) {
//   // default route to '/'
//   if (typeof filepath !== 'string') {
//     fn = filepath;
//     filepath = '/';
//   }

//   // strip trailing slash
//   if (filepath[filepath.length - 1] === '/') {
//     filepath = filepath.slice(0, -1);
//   }

//   // add the middleware
//   debug.plugin('use %s %s', filepath || '/', fn.name || 'anonymous');
//   this._stack.push({ path: filepath, handle: fn });
//   return this;
// };


/**
 * Lazily initalize router, to allow options to
 * be passed in after init.
 *
 * @api private
 */

Template.prototype.lazyrouter = function() {
  if (!this._router) {
    this._router = new Router({
      caseSensitive: this.enabled('case sensitive routing'),
      strict: this.enabled('strict routing')
    });
  }
};


/**
 * Dispatch a template through a middleware stack
 *
 * @param  {arguments} `arguments` Any arguments that should be passed through the middleware stack
 * @api private
 */

Template.prototype.middleware = function () {
  debug.routes('#routes:middleware', arguments);
  this.lazyrouter();
  this._router.middleware.apply(this._router, arguments);
};


/**
 * Set a router to be called.
 *
 * @param  {Function|String} `filter` Either string or filter function used to determine which middleware stack to run.
 * @param  {Function|Array}  `middleware` Middleware stack to run for this filter.
 * @return {Object} `Template` to enable chaining.
 * @api private
 */

Template.prototype.route = function (filter) {
  debug.routes('#route', arguments);
  this.lazyrouter();

  /* if the filter is a string, turn it into a filter that
   * we expect for view-cache */

  if (typeof filter === 'string' || filter instanceof RegExp) {
    var str = filter;
    filter = function routeFilter(value, key) {
      debug.middleware('#route:filter', str, arguments);
      this.createPathRegex(str);
      var match = this.matchStr(key);
      debug.middleware('#route:filter', match);
      return match;
    };
  }

  var args = [filter].concat([].slice.call(arguments, 1));
  debug.routes('#route', args);

  this._router.route.apply(this._router, args);
  return this;
};


/**
 * **Example:**
 *
 * ```js
 * var routes = template.router();
 * routes.route(':basename.hbs', function (file, params, next) {
 *   // do something with the file
 *   next();
 * });
 *
 * template.src('')
 *   .pipe(routes())
 *   .pipe(template.dest())
 * ```
 *
 * @param  {Object} `options`
 * @return {Function}
 */

// Template.prototype.router = function(options) {
//   var self = this;

//   var opts = _.defaults({}, options, this.options, {
//     caseSensitive: this.enabled('case sensitive routing'),
//     strict: this.enabled('strict routing')
//   });

//   var router = new Router(opts);

//   // make a new function that gets returned for later use
//   var rte = function() {
//     opts.router = router;
//     return routes.call(self, opts);
//   };

//   // add new routes to the specific router
//   rte.route = function(route, fn) {
//     router.route(route, fn);
//   };

//   // return the new function
//   return rte;
// };


/**
 * Proxy to `Router#param()` with one added api feature. The _name_ parameter
 * can be an array of names.
 *
 * @param {String|Array} `name`
 * @param {Function} `fn`
 * @return {Object} `Template` to enable chaining
 * @api public
 */

// Template.prototype.param = function(name, fn){
//   var self = this;
//   this.lazyrouter();

//   if (Array.isArray(name)) {
//     name.forEach(function(key) {
//       self.param(key, fn);
//     });
//     return this;
//   }

//   this._router.param(name, fn);
//   return this;
// };


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
 * @param  {Object} `file` Template object, with `content` property.
 * @return  {String} Either the string wrapped with a layout, or the original string if no layout was defined.
 * @api private
 */

Template.prototype.applyLayout = function(ext, template, locals) {
  debug.layout('#{lazyLayouts} ext: %s', ext);

  var layout = utils.pickLayout(template, locals, true);
  var layoutEngine = this.layoutSettings[path.extname(layout)];
  if (!layoutEngine) {
    layoutEngine = this.layoutSettings[ext];
  }

  var obj = utils.pickContent(template);

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
 * Load default helpers.
 *
 * @api private
 */

Template.prototype.defaultTypeHelpers = function(type, plural) {
  this.addHelper(type, function (key, locals) {
    var partial = this.cache[plural][key];
    partial = this.extendLocals('partial', partial, locals);
    return this.renderSync(partial);
  });
};


/**
 * Automatically adds an async helper for each template type.
 *
 * @param {String} `type` The type of template.
 * @param {String} `plural` Plural form of `type`.
 * @api private
 */

Template.prototype.defaultAsyncHelpers = function (type, plural) {
  this.addHelperAsync(type, function (name, locals, next) {
    var last = _.last(arguments);

    debug.helper('#{async helper name}:', name);

    if (typeof locals === 'function') {
      next = locals;
      locals = {};
    }

    if (typeof next !== 'function') {
      next = last;
    }

    var partial = this.cache[plural][name];
    if (!partial) {
      // TODO: should this throw an error _here_?
      console.log(chalk.red('helper {{' + type + ' "' + name + '"}} not found.'));
      next(null, '');
      return;
    }

    partial.locals = extend({}, partial.locals, locals);
    debug.helper('#{async helper partial}:', partial);

    this.render(partial, {}, function (err, content) {
      debug.helper('#{async helper rendering}:', content);

      if (err) {
        next(err);
        return;
      }
      next(null, content);
      return;
    });
  }.bind(this));
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

Template.prototype.makeDelims = function (arr, options) {
  var settings = extend({}, options, {escape: true});
  var delims = this._.delims.templates(arr, settings);

  debug.delims('#{making delims}: ', delims);
  return extend(delims, options);
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

Template.prototype.addDelims = function (ext, arr, layoutDelims, settings) {
  debug.delims('#{adding delims} ext: %s, delims:', ext, arr);

  if (Array.isArray(layoutDelims)) {
    this.lazyLayouts(ext, settings || {});
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
  if(hasOwn(this.delims, ext)) return this.delims[ext];
  ext = this.currentDelims || 'default';
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
  return this.currentDelims = ext;
};


/**
 * Generate a temporary id for an unknown template.
 */

Template.prototype.id = function () {
  return id({prefix: '__id', suffix: '__'});
};


/**
 * Private method for registering an engine.
 *
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Object} `Template` to enable chaining
 * @api private
 */

Template.prototype._registerEngine = function (ext, fn, options) {
  var opts = extend({thisArg: this, bindFunctions: true}, options);

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
 * @return {Object} `Template` to enable chaining
 * @api public
 */

Template.prototype.engine = function (extension, fn, options) {
  debug.engine('#{engine} args: ', arguments);
  utils.arrayify(extension).forEach(function (ext) {
    this._registerEngine(ext, fn, options);
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

Template.prototype.getEngine = function (ext) {
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
 * @api public
 */

Template.prototype.addMixin = function (name, fn) {
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

Template.prototype.helper = function (ext) {
  debug.helper('#{helper} ext: %s', ext);
  return this.getEngine(ext).helpers;
};


/**
 * Register helpers for the given `ext` (engine).
 *
 * ```js
 * engine.helpers(require('handlebars-helpers'));
 * ```
 *
 * @param {String} `ext` The engine to register helpers with.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.helpers = function (ext) {
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

Template.prototype.addHelper = function (name, fn, thisArg) {
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

Template.prototype.addHelperAsync = function (name, fn, thisArg) {
  debug.helper('#{adding async helper} name: %s', name);
  return this._.helpers.addHelperAsync(name, fn, thisArg);
};


/**
 * Keeps track of custom view types, so we can pass them properly to
 * registered engines.
 *
 * @param {String} `plural`
 * @param {Object} `opts`
 * @api private
 */

Template.prototype.trackType = function (plural, options) {
  debug.template('#{tracking type}: %s, %s', plural);
  var opts = extend({}, options);
  var type = this.templateType;

  if (opts.isRenderable) {
    type.renderable.push(plural);
  }
  if (opts.isLayout) {
    type.layout.push(plural);
  }
  if (opts.isPartial || (!opts.isRenderable && !opts.isLayout)) {
    type.partial.push(plural);
  }
  return type;
};


/**
 * Get all cached templates of the given `plural` type.
 *
 * ```js
 * var pages = template.getType('renderable');
 * //=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
 *
 * var partials = template.getType('partial');
 * ```
 *
 * @param {String} `plural`
 * @param {Object} `opts`
 * @api private
 */

Template.prototype.getType = function (type) {
  var arr = this.templateType[type];

  return arr.reduce(function (acc, key) {
    acc[key] = this.cache[key];
    return acc;
  }.bind(this), {});
};


/**
 * Add a new template `type`, along with associated get/set methods.
 * You must specify both the singular and plural names for the type.
 *
 * @param {String} `type` Singular name of the type to create, e.g. `page`.
 * @param {String} `plural` Plural name of the template type, e.g. `pages`.
 * @param {Object} `options` Options for the template type.
 *   @option {Boolean} [options] `isRenderable` Is the template a partial view?
 *   @option {Boolean} [options] `layout` Can the template be used as a layout?
 *   @option {Boolean} [options] `partial` Can the template be used as a partial?
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.create = function(type, plural, options, fns) {
  debug.template('#{creating template}: %s', type);

  var args = [].slice.call(arguments);

  if (typeof plural !== 'string') {
    fns = options;
    options = plural;
    plural = type + 's';
  }

  if (typeof options === 'function') {
    fns = options;
    options = {};
  }

  var middleware = utils.filterMiddleware(fns, args);

  this.cache[plural] = this.cache[plural] || {};
  this.trackType(plural, options);
  this.typeMiddleware(plural, middleware);

  Template.prototype[type] = function (key, value, locals, opt) {
    debug.template('#{creating template type}:', type);
    this[plural].apply(this, arguments);
  };

  Template.prototype[plural] = function (key, value, locals, opt) {
    debug.template('#{creating template plural}:', plural);
    this.load(plural, options).apply(this, arguments);
  };

  // Create `get` method => e.g. `template.getPartial()`
  var name = type[0].toUpperCase() + type.slice(1);
  Template.prototype['get' + name] = function (key) {
    return this.cache[plural][key];
  };

  if (!hasOwn(this._.helpers, type)) {
    this.addHelper(type, function (key, locals, hash) {
      this.extendLocals('partial', locals);
      var partial = this.cache[plural][key];
      return this.renderSync(partial, locals);
    });
  }

  // if (!hasOwn(this._.helpers, type)) {
  //   this.defaultAsyncHelpers(type, plural);
  // }

  return this;
};


/**
 * Add type middleware to the router for the specific type.
 *
 * @param  {String} `type` Template type used for this middleware.
 * @param  {Function|Array} `middleware` Stack of middleware to run for this type.
 */
Template.prototype.typeMiddleware = function(type, middleware) {
  var filter = function (value, key) {
    if (!value || !value.options) {
      return false;
    }
    return value.options.type === type;
  };
  this.route(filter, middleware);
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

Template.prototype.load = function (plural, options) {
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
    forOwn(template, function (value, key) {
      this.middleware(value, key, function (err) {
        if (err) console.log(err);
      });
    }.bind(this));

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

Template.prototype.normalize = function (plural, template, options) {
  debug.template('#{normalize} args:', arguments);
  this.lazyrouter();

  if (this.option('normalize')) {
    return this.options.normalize.apply(this, arguments);
  }

  var renameKey = this.option('renameKey');

  forOwn(template, function (value, key) {
    value.options = extend({type: plural}, options, value.options);
    key = renameKey.call(this, key);

    var ext = utils.pickExt(value, value.options, this);
    this.lazyLayouts(ext, value.options);

    var isLayout = utils.isLayout(value);
    utils.pickLayout(value);


    // Dispatch routes
    // var results = this._router.middlewareSync(value);
    // if (results.err) {
    //   throw new Error(results.err);
    // }
    // console.log('results:', results);
    // console.log('value:', value);

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

Template.prototype.format = function (key, value, locals) {
  debug.template('#{format} args:', arguments);

  // Temporarily load a template onto the cache to normalize it.
  var load = this.load('anonymous', { isRenderable: true });
  load.apply(this, arguments);

  // Get the normalized template and return it.
  var template = this.cache['anonymous'][key];
  return this.extendLocals('render', template, locals);
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

Template.prototype.mergePartials = function (ext, locals, combine) {
  debug.template('#{merging partials} args:', arguments);

  combine = combine || this.option('mergePartials');
  var opts = extend({partials: {}}, locals);

  // this.cache.partials  = extend({}, this.cache.partials, opts.partials);

  this.templateType['partial'].forEach(function (type) {
    forOwn(this.cache[type], function (value, key) {
      value.content = this.applyLayout(ext, value, value.locals);
      opts = extend({}, opts, value.data, value.locals);
      if (combine) {
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

Template.prototype.preprocess = function (template, locals, cb) {
  if (typeof locals === 'function') {
    cb = locals;
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
    tmpl = utils.pickCached(template, this);
    if (!tmpl) {
      tmpl = utils.pickPartial(template, this);
    }
  }

  if (tmpl) {
    template = tmpl;
    template = this.extendLocals('render', template, locals);
  } else {
    key = utils.generateId();
    template = this.format(key, template, locals);
  }

  if (utils.isObject(template)) {
    content = template.content;
    locals = this.mergeFn(template, locals);
    delims = delims || utils.pickDelims(template, locals);

  } else {
    content = template;
  }

  var ext = utils.pickExt(template, locals, this);

  // if a layout is defined, apply it now.
  content = this.applyLayout(ext, template, locals);
  // Ensure that `content` is a string.
  if (utils.isObject(content)) {
    content = content.content;
  }

  if (delims) this.addDelims(ext, delims);
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

  locals = extend({}, locals, this.mergePartials(locals), delims);

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

Template.prototype.render = function (content, locals, cb) {
  var self = this;
  var state = {};

  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }


  var ext = self.option('viewEngine');
  state.content = content;
  state.locals = locals;
  state.engine = self.getEngine(ext);

  if (self.option('preprocess')) {
    state = self.preprocess(state.content, state.locals);
  }

  try {
    state.engine.render(state.content, state.locals, function (err, res) {
      if (err) {
        console.log(err);
        return cb.call(self, err, res);
      }
      return self._.helpers.resolve(res, function (err, res) {
        if (err) console.log(err);
        return cb.call(self, err, res);
        // return self.middleware(state, state.locals.path, function (err) {
        //   if (err) console.log(err);
        //   cb.call(self, err, state.content);
        // });
      });
    });
  } catch (err) {
    cb(err);
  }
};


/**
 * Render `content` with the given `locals`.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderSync = function (content, locals) {
  var ext = this.option('viewEngine');
  var engine = this.getEngine(ext);

  if (this.option('preprocess')) {
    var pre = this.preprocess(content, locals);
    content = pre.content;
    locals = pre.locals;
    engine = pre.engine;
  }

  if (!hasOwn(engine, 'renderSync')) {
    throw new Error('`.renderSync()` method not found on engine: "' + engine + '".');
  }

  try {
    return engine.renderSync(content, locals);
  } catch (err) {
    return err;
  }
};


Template.prototype.extendLocals = function (key, template, locals) {
  template = extend({_locals: {}}, template);
  template._locals[key] = extend({}, template._locals[key], locals);
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

Template.prototype.mergeFn = function (template, locals) {
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

  o.helpers = extend({}, this._.helpers, o.helpers);
  return extend(data, o, locals);
};
