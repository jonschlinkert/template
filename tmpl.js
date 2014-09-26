/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var util = require('util');
var path = require('path');
var Delimiters = require('delimiters');
var loader = require('load-templates');
var Engines = require('engine-cache');
var Helpers = require('helper-cache');
var Parsers = require('parser-cache');
var Storage = require('config-cache');
var Layouts = require('layouts');
var logger = require('./lib/logger');
var utils = require('./lib/utils');
var extend = _.extend;
var merge = _.merge;


/**
 * Create a new instance of `Template`, optionally passing the default
 * `context` and `options` to use.
 *
 * **Example:**
 *
 * ```js
 * var Template = require('engine');
 * var engine = new Template();
 * ```
 *
 * @class `Template`
 * @param {Object} `context` Context object to start with.
 * @param {Object} `options` Options to use.
 * @api public
 */

function Template(options) {
  Delimiters.call(this, options);
  Storage.call(this, options);
  this.init();
}

util.inherits(Template, Storage);
extend(Template.prototype, Delimiters.prototype);


/**
 * Initialize defaults.
 *
 * @api private
 */

Template.prototype.init = function() {
  this.engines = this.engines || {};
  this.parsers = this.parsers || {};
  this._ = {};

  this.delims = {};
  this.viewType = {};
  this.viewType.partial = [];
  this.viewType.renderable = [];
  this.viewType.layout = [];
  this.layoutSettings = {};

  this.defaultOptions();
  this.defaultConfig();
  this.defaultTemplates();
  this.defaultParsers();
  this.defaultEngines();
};


/**
 * Initialize default cache configuration.
 *
 * @api private
 */

Template.prototype.defaultConfig = function() {
  this._.parsers = new Parsers(this.parsers);
  this._.engines = new Engines(this.engines);
  this._.helpers = new Helpers({
    bindFunctions: true,
    thisArg: this
  });

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
  this.option('defaultExtensions', ['md', 'html', 'hbs']);
  this.option('destExt', '.html');
  this.option('ext', '*');

  // Delimiters
  this.option('delims', {});
  this.option('viewEngine', '.*');
  this.option('engineDelims', null);
  this.option('layoutTag', 'body');
  this.option('layoutDelims', ['{%', '%}']);
  this.option('layout', null);

  this.option('partialLayout', null);
  this.option('mergePartials', true);
  this.option('mergeFunction', merge);
  this.option('bindHelpers', true);

  // loader options
  this.option('renameKey', function (filepath) {
    return path.basename(filepath);
  });

  this.addDelims('*', ['<%', '%>']);
};


/**
 * Load default parsers
 *
 * @api private
 */

Template.prototype.defaultParsers = function() {
  var ext = this.option('defaultExtensions');
  this.parser(ext, require('parser-front-matter'));
  this.parser('*', require('parser-noop'));
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
  var ext = this.option('defaultExtensions');

  this.engine(ext, require('engine-lodash'), {
    layoutDelims: ['{%', '%}'],
    destExt: '.html'
  });

  this.engine('*', require('engine-noop'), {
    layoutDelims: ['{%', '%}'],
    destExt: '.html'
  });
};


/**
 * Register default template types.
 *
 * @api private
 */

Template.prototype.defaultTemplates = function() {
  this.create('page', 'pages', {renderable: true});
  this.create('layout', 'layouts', {layout: true});
  this.create('partial', 'partials');
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
  if (!this.layoutSettings.hasOwnProperty(ext)) {
    var opts = merge({}, this.options, options);

    this.layoutSettings[ext] = new Layouts({
      delims: opts.layoutDelims,
      layouts: opts.layouts,
      locals: opts.locals,
      tag: opts.layoutTag
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

Template.prototype.applyLayout = function(ext, file) {
  var layoutEngine = this.layoutSettings[ext];
  var o = utils.pickContent(file);

  if (!!layoutEngine) {
    var layout = this.determineLayout(file);
    var obj = layoutEngine.render(o.content, layout);
    return obj.content;
  }

  return o;
};


/**
 * Define a parser.
 *
 * Register the given parser callback `fn` as `ext`. If `ext`
 * is not given, the parser `fn` will be pushed into the
 * default parser stack.
 *
 * {%= docs("api-parser") %}
 *
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @param {Function} `fn` Callback function.
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.parser = function (extensions, options, fn) {
  var args = [].slice.call(arguments, 1);

  utils.arrayify(extensions).forEach(function (ext) {
    this._.parsers.register.apply(this, [ext].concat(args));
  }.bind(this));

  return this;
};


/**
 * Run a stack of async parsers.
 *
 * Run a `stack` of parsers against the given `file`. If `file` is
 * an object with a `path` property, then the `extname` is used to
 * get the parser stack. If a stack isn't found on the cache the
 * default `noop` parser will be used.
 *
 * @doc api-parse
 * @param  {Object|String} `file` Either a string or an object.
 * @param  {Array} `stack` Optionally pass an array of functions to use as parsers.
 * @param  {Object} `options`
 * @return {Object} Normalize `file` object.
 * @api public
 */

Template.prototype.parse = function (file, stack, options) {
  return this._parse('parse', file, stack, options);
};


/**
 * Run a stack of sync parsers.
 *
 * Run a `stack` of sync parsers against the given `file`. If `file` is
 * an object with a `path` property, then the `extname` is used to
 * get the parser stack. If a stack isn't found on the cache the
 * default `noop` parser will be used.
 *
 * @doc api-parseSync
 * @param  {Object|String} `file` Either a string or an object.
 * @param  {Array} `stack` Optionally pass an array of functions to use as parsers.
 * @param  {Object} `options`
 * @return {Object} Normalize `file` object.
 * @api public
 */

Template.prototype.parseSync = function (file, stack, options) {
  return this._parse('parseSync', file, stack, options);
};


/**
 * Private method for normalizing args passed to parsers.
 *
 * @param  {Object|String} `file` Either a string or an object.
 * @param  {Array} `stack` Optionally pass an array of functions to use as parsers.
 * @param  {Object} `options`
 * @return {Object} Normalize `file` object.
 * @api private
 */

Template.prototype._parse = function (method, file, stack, options) {
  var ext = null;

  if (typeof file === 'object') {
    var o = merge({}, options, file);
    ext = o.ext;
  }

  if (Array.isArray(stack) && stack.length > 0) {
    return this._.parsers[method](file, stack, options);
  } else {
    options = stack;
    stack = null;
  }

  if (ext) {
    stack = this.getParsers(ext);
  }
  if (!stack) {
    stack = this.getParsers('*');
  }

  return this._.parsers[method](file, stack, options);
};


/**
 * Get the parser stack for the given `ext`.
 *
 * @param {String} `ext` The parser stack to get.
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.getParsers = function (ext) {
  return this._.parsers.get.apply(this, arguments);
};


/**
 * Get delimiters from the cache.
 */

Template.prototype._getDelims = function (ext) {
  return utils.pick(this.getDelims(ext), [
    'interpolate',
    'evaluate',
    'escape'
  ]);
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
  var engine = this._.engines.get(ext);
  engine.options = utils.omit(engine.options, 'thisArg');
  return engine;
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
  var engine = this.getEngine(ext);
  return engine.helpers;
};


/**
 * Register a helper for the given `ext` (engine).
 *
 * ```js
 * engine.helper('lower', function(str) {
 *   return str.toLowerCase();
 * });
 * ```
 *
 * @param {String} `ext` The engine to register helpers with.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

// Template.prototype.helper = function (ext) {
//   var engine = this.getEngine(ext);
//   return engine.helpers;
// };


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
  var opts = merge({thisArg: this, bindFunctions: true}, options);
  this._.engines.register(ext, fn, opts);

  ext = utils.formatExt(ext);

  if (opts.delims) {
    this.addDelims(ext, opts.delims);
    this.engines[ext].delims = this._getDelims(ext);
  }

  this.lazyLayouts(ext, opts);
  return this;
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
  return this._.helpers.addHelperAsync(name, fn, thisArg);
};


/**
 * Automatically adds an async helper for each template type.
 *
 * @param {String} `type` The type of template.
 * @param {String} `plural` Plural form of `type`.
 * @api private
 */

Template.prototype._addHelperAsync = function (type, plural) {
  this.addHelperAsync(type, function (name, locals, next) {
    var last = _.last(arguments);

    if (typeof locals === 'function') {
      next = locals;
      locals = {};
    }
    if (typeof next !== 'function') {
      next = last;
    }

    var partial = this.cache[plural][name];
    if (!partial) {
      logger.notify(type, name);
      next(null, '');
      return;
    }

    partial.locals = merge({}, partial.locals, locals);

    this.render(partial, {}, function (err, content) {
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
 * Load templates and normalize them to an object with consistent
 * properties.
 *
 * See [load-templates] for more details.
 *
 * @param {String|Array|Object}
 * @return {Object}
 */

Template.prototype.loadTemplate = function (plural, options) {
  var opts = merge({}, this.options, options);
  var load = loader(opts);

  return function(key, value, locals) {
    var loaded = load.apply(this, arguments);
    var template = this.normalize(loaded, options);

    merge(this.cache[plural], template);
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

Template.prototype.normalize = function (template, options) {
  if (this.option('normalize')) {
    return this.options.normalize.apply(this, arguments);
  }

  var opts = extend({}, options);
  var rename = opts.renameKey || this.option('renameKey');

  return _.transform(template, function(acc, val, key) {
    val.options = merge({}, options, val.options);

    key = rename.call(this, key);
    acc[key] = val;
  }.bind(this));
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

Template.prototype.cacheTemplate = function (key, value, locals) {
  var load = this.loadTemplate('anonymous', {renderable: true});
  load.apply(this, arguments);

  return this.cache['anonymous'][key];
};


/**
 * Keeps track of custom view types, so we can pass them properly to
 * registered engines.
 *
 * @param {String} `plural`
 * @param {Object} `opts`
 * @api private
 */

Template.prototype.setType = function (plural, options) {
  var opts = merge({}, options);
  var type = this.viewType;

  if (opts.renderable) {
    type.renderable.push(plural);
  } else if (opts.layout) {
    type.layout.push(plural);
  } else {
    type.partial.push(plural);
  }
};


/**
 * Add a new template `type`, along with associated get/set methods.
 * You must specify both the singular and plural names for the type.
 *
 * @param {String} `type` Singular name of the type to create, e.g. `page`.
 * @param {String} `plural` Plural name of the template type, e.g. `pages`.
 * @param {Object} `options` Options for the template type.
 *   @option {Boolean} [options] `renderable` Is the template a partial view?
 *   @option {Boolean} [options] `layout` Can the template be used as a layout?
 *   @option {Boolean} [options] `partial` Can the template be used as a partial?
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.create = function(type, plural, options) {
  if (typeof plural !== 'string') {
    throw new Error('A plural form must be defined for: "' + type + '".');
  }

  this.cache[plural] = this.cache[plural] || {};
  this.setType(plural, options);

  Template.prototype[type] = function (key, value, locals, opt) {
    this[plural](key, value, locals, opt);
  };

  Template.prototype[plural] = function (key, value, locals, opt) {
    this.loadTemplate(plural, options).apply(this, arguments);
    return this;
  };

  if (!this._.helpers.hasOwnProperty(type)) {
    this._addHelperAsync(type, plural);
  }
  return this;
};


/**
 * Get partials from the cache. More specifically, all templates with
 * a `viewType` of `partial` defined. If `options.mergePartials` is `true`,
 * this object will keep custom partial types seperate - otherwise, all
 * templates with the type `partials` will be merged onto the same object.
 * This is useful when necessary for the engine being used.
 *
 * @api private
 */

Template.prototype.mergePartials = function (options, shouldMerge) {
  shouldMerge = shouldMerge || this.option('mergePartials');
  var opts = extend({partials: {}}, options);

  this.cache.partials  = extend({}, this.cache.partials, opts.partials);

  this.viewType['partial'].forEach(function (type) {
    _.forOwn(this.cache[type], function (value, key) {
      if (shouldMerge) {
        opts.partials[key] = value.content;
      } else {
        opts[type][key] = value.content;
      }
      opts = merge({}, opts, value.data, value.locals);
    });

  }.bind(this));

  return opts;
};


/**
 * Render `str` with the given `options` and `callback`.
 *
 * @param  {Object|String} `file` String or normalized template object.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.render = function (template, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var tmpl;
  var key;
  var opts = merge({}, options);
  var engine = opts.engine;
  var delims = opts.delims;
  var content = template;
  var locals = opts;
  var ext = locals.ext;

  if (this.option('cache')) {
    tmpl = utils.pickCached(template, opts, this);
  }

  if (tmpl) {
    template = tmpl;
  } else {
    key = utils.generateId();
    template = this.cacheTemplate(key, template, options);
  }

  if (utils.isObject(template)) {
    locals = this.mergeFn(template, locals);
    content = template.content;

    delims = template.options.delims || delims;
    ext = utils.pickExt(template, opts, this);

    if (delims) {
      this.addDelims(ext, delims);
    }

  } else {
    content = template;
  }

  var delimiters = this._getDelims(ext);
  engine = this.getEngine(ext);

  if (delimiters) {
    locals = merge({}, locals, delimiters);
  }

  this.useDelims(ext);
  locals = this.mergePartials(locals);

  try {
    engine.render(content, locals, function (err, res) {
      var opt = extend({}, this.options, locals);
      if (opt.pretty) {
        res = this.prettify(res, opt.pretty);
      }
      return this._.helpers.resolve(res, cb.bind(this));
    }.bind(this));
  } catch (err) {
    cb(err);
  }
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
  var locs = {};

  if (this.option('mergeFn')) {
    return this.option('mergeFn').apply(this, arguments);
  }

  if (utils.isObject(template)) {
    locs = merge({}, template.data, template.locals);
  }

  locs.helpers = merge({}, this._.helpers, locs.helpers);
  locs = merge({}, locs, locals);
  return locs;
};


/**
 * Format HTML using [js-beautify].
 *
 * @param  {String} `html` The HTML to beautify.
 * @param  {Object} `options` Options to pass to [js-beautify].
 * @return {String} Formatted string of HTML.
 */

Template.prototype.prettify = function(html, options) {
  return prettify(html, extend({
    indent_handlebars: true,
    indent_inner_html: true,
    preserve_newlines: false,
    max_preserve_newlines: 1,
    brace_style: 'expand',
    indent_char: ' ',
    indent_size: 2,
  }, options));
};


module.exports = Template;