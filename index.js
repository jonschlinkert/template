/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var util = require('util');
var path = require('path');
var chalk = require('chalk');
var Delimiters = require('delimiters');
var Engines = require('engine-cache');
var Parsers = require('parser-cache');
var Storage = require('simple-cache');
var Layouts = require('layouts');
var extend = _.extend;


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

function Template(options) {
  Delimiters.call(this, options);
  Storage.call(this, options);

  this.init();

  this.defaultConfig();
  this.defaultOptions();
  this.defaultEngines();
  this.defaultHelpers();
  this.defaultParsers();
  this.defaultTemplates();
}

util.inherits(Template, Storage);
extend(Template.prototype, Delimiters.prototype);


/**
 * Initialize default cache configuration.
 *
 * @api private
 */

Template.prototype.init = function() {
  this.engines = this.engines || {};
  this.parsers = this.parsers || {};

  this._ = {};

  this._.helpers = this.helpers || {};
  this._.parsers = new Parsers(this.parsers);
  this._.engines = new Engines(this.engines);
};


/**
 * Initialize default cache configuration.
 *
 * @api private
 */

Template.prototype.defaultConfig = function() {
  this.set('locals', {});

  this.set('imports', {});
  this.set('helpers', {});
  this.set('parsers', {});
  this.set('mixins', {});

  this.set('templates', {});
  this.set('layouts', {});
  this.set('partials', {});
  this.set('pages', {});
};


/**
 * Initialize default options.
 *
 * @api private
 */

Template.prototype.defaultOptions = function() {
  this.option('cwd', process.cwd());

  this.option('bindHelpers', true);
  this.option('layout', null);
  this.option('layoutTag', 'body');
  this.option('partialLayout', null);

  this.option('delims', {});
  this.option('layoutDelims', ['{{', '}}']);

  this.addDelims('*', ['<%', '%>']);
  this.addDelims('es6', ['${', '}'], {
    interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
  });
};


/**
 * Load default parsers
 *
 * @api private
 */

Template.prototype.defaultParsers = function() {
  this.parser('md', require('parser-front-matter'));
  this.parser('*', require('parser-noop'));
};


/**
 * Load default engines.
 *
 * @api private
 */

Template.prototype.defaultEngines = function() {
  this.engine('md', require('engine-lodash'));
  this.engine('*', require('engine-noop'));
};


/**
 * Load default helpers.
 *
 * @api private
 */

Template.prototype.defaultHelpers = function() {
  var self = this;

  this.addHelper('partial', function (name, locals, settings) {
    return self.render(name, locals, settings);
  });
};


/**
 * Register default template types.
 *
 * @api private
 */

Template.prototype.defaultTemplates = function() {
  this.create('layout', 'layouts', {isLayout: true});
  this.create('partial', 'partials');
  this.create('page', 'pages');
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

Template.prototype.lazyLayouts = function(options) {
  if (!this._layouts) {
    var opts = _.extend({}, this.options, options);

    this._layouts = new Layouts({
      locals: opts.locals,
      layouts: opts.layouts,
      delims: opts.layoutDelims,
      tag: opts.layoutTag
    });
  }
};


/**
 * Register the given parser callback `fn` as `ext`. If `ext`
 * is not given, the parser `fn` will be pushed into the
 * default parser stack.
 *
 * ```js
 * // Default stack
 * template.parser(require('parser-front-matter'));
 *
 * // Associated with `.hbs` file extension
 * template.parser('hbs', require('parser-front-matter'));
 * ```
 *
 * See [parser-cache] for the full range of options and documentation.
 *
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.parser = function (ext, options, fn) {
  this._.parsers.register.apply(this, arguments);
  return this;
};


/**
 * Run a stack of parser for the given `file`. If `file` is an object
 * with an `ext` property, then `ext` is used to get the parser
 * stack. If `ext` doesn't have a stack, the default `noop` parser
 * will be used.
 *
 * ```js
 * var str = fs.readFileSync('some-file.md', 'utf8');
 * template.parse({ext: '.md', content: str}, function (err, file) {
 *   console.log(file);
 * });
 * ```
 *
 * Or, explicitly pass an array of parser functions as a section argument.
 *
 * ```js
 * template.parse(file, [a, b, c], function (err, file) {
 *   console.log(file);
 * });
 * ```
 * See [parser-cache] for the full range of options and documentation.
 *
 * @param  {Object|String} `file` Either a string or an object.
 * @param  {Array} `stack` Optionally pass an array of functions to use as parsers.
 * @param  {Object} `options`
 * @return {Object} Normalize `file` object.
 */

Template.prototype.parse = function (file, stack, options) {
  var o = _.merge({}, options);

  if (typeof file === 'object') {
    o = _.merge({}, o, file);
  }

  var ext = o.ext;

  if (!Array.isArray(stack)) {
    options = stack;
    stack = null;
  }

  if (ext) {
    stack = this.getParsers(ext);
  }

  if (!stack) {
    stack = this.getParsers('*');
  }

  this._.parsers.parse(file, stack, options);
  return this;
};


/**
 * Get a cached parser stack for the given `ext`.
 *
 * @param {String} `ext` The parser stack to get.
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.getParsers = function (ext) {
  return this._.parsers.get.apply(this, arguments);
};


/**
 * Register the given view engine callback `fn` as `ext`. If only `ext`
 * is passed, the engine registered for `ext` is returned. If no `ext`
 * is passed, the entire cache is returned.
 *
 * ```js
 * var consolidate = require('consolidate')
 * template.engine('hbs', consolidate.handlebars);
 * template.engines('hbs');
 * // => {render: [function], renderFile: [function]}
 * ```
 *
 * See [engine-cache] for details and documentation.
 *
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Object} `Template` to enable chaining
 * @api public
 */

Template.prototype.engine = function (ext, options, fn) {
  var args = [].slice.call(arguments);

  if (args.length <= 1) {
    return this._.engines.get(ext);
  }

  this._.engines.register(ext, options, fn);
  return this;
};


/**
 * Get the engine registered for the given `ext`. If no
 * `ext` is passed, the entire cache is returned.
 *
 * ```js
 * var consolidate = require('consolidate')
 * template.engine('hbs', consolidate.handlebars);
 * template.getEngine('hbs');
 * // => {render: [function], renderFile: [function]}
 * ```
 *
 * @param {String} `ext` The engine to get.
 * @return {Object} Object of methods for the specified engine.
 * @api public
 */

Template.prototype.getEngine = function (ext) {
  return this._.engines.get(ext);
};


/**
 * Register the given helper `fn` as `name`.
 *
 * @param {String} `name` The name of the helper.
 * @param {String} `fn` The helper function.
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.helper = function (name, fn) {
  this.cache.helpers[name] = _.bind(fn, this);
  return this;
};


/**
 * Get and set helpers for the given `ext` (engine). If no
 * `ext` is passed, the entire helper cache is returned.
 *
 * @param {String} `ext` The helper cache to get and set to.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.helpers = function (ext) {
  return this.getEngine(ext).helpers;
};


/**
 * Get and set helpers for the given `ext` (engine). If no
 * `ext` is passed, the entire helper cache is returned.
 *
 * @param {String} `ext` The helper cache to get and set to.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.addHelper = function (ext) {
  return this.getEngine(ext).helpers;
};


/**
 * Add a new template `type` and methods to the `Template.prototype`
 * by passing the singular and plural names to be used.
 *
 * @param {String} `type` Name of the new type to add
 * @param {Object} `options`
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

Template.prototype.create = function(type, plural, isLayout) {
  if (typeof plural !== 'string') {
    throw new Error('A plural form must be defined for: "' + type + '".');
  }

  this.cache[plural] = {};

  Template.prototype[type] = function (key, template, data) {
    if (typeof key === 'object') {
      _.extend(this.cache[plural], key);
    } else {
      this.cache[plural][key] = {content: template, data: data};
    }

    // if (isLayout) {
      // this._addLayout(ext, key, file, opts);
    // }
    return this;
  };

  Template.prototype[plural] = function (key, value) {
    var args = [].slice.call(arguments);
    if (!args.length) {
      return this.cache[plural];
    }
    return this;
  };

  return this;
};


/**
 * Render `str` with the given `options` and `callback`.
 *
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.render = function (file, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  if (typeof file !== 'object' || file && !file.hasOwnProperty('content')) {
    throw new Error('render() expects "' + chalk.yellow(file) + '" to be an object.');
  }

  opts = extend({}, opts, _.omit(file, ['content']));

  var ext = opts.ext || path.extname(file.path) || '*';
  var engine = this.getEngine(ext);

  try {
    engine.render(file.content, opts, function (err, content, destExt) {
      if (err) {
        return cb(err);
      }

      ext = opts.ext || engine.outputFormat || destExt || ext;
      if (ext && ext[0] !== '.') {
        ext = '.' + ext;
      }

      cb(null, content, ext);
    }.bind(this));
  } catch (err) {
    cb(err);
  }
};


/**
 * Expose `Template`
 *
 * @type {Class}
 */

module.exports = Template;

