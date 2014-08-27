/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');
var Layouts = require('layouts');
var Delimiters = require('delimiters');
var Engines = require('engine-cache');
var Parsers = require('parser-cache');
var Helpers = require('helper-cache');
var Cache = require('simple-cache');
var _ = require('lodash');
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
  Cache.call(this, options);

  this._helpers = new Helpers();
  this._engines = new Engines();
  this._parsers = new Parsers();

  this.engines = this.engines || {};
  this.parsers = this.parsers || {};
  // this.helpers = this.helpers || {};

  this.defaultConfig();
  this.defaultOptions();
  this.defaultEngines();
  this.defaultParsers();
}

util.inherits(Template, Cache);
extend(Template.prototype, Delimiters.prototype);


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
  this.set('routes', {});
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
  this.option('partialLayout', null);
  this.option('layout', null);
  this.option('layoutTag', 'body');

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
 * Register the given view engine callback `fn` as `ext`.
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
  this._engines.register.apply(this, arguments);

  if (typeof ext !== 'string') {
    ext = '*';
  }
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  this.helpers[ext] = new Helpers();
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
  return this._engines.get.apply(this, arguments);
};


/**
 * Get and set helpers for the given `ext` (engine). If no
 * `ext` is passed, the entire helper cache is returned.
 *
 *
 * @param {String} `ext` The helper cache to get and set to.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Template.prototype.helpers = function (ext) {
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }
  return this.helpers[ext];
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
  this._parsers.register.apply(this, arguments);
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
  var args = [].slice.call(arguments);

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

  this._parsers.parse.call(this, file, stack, options);
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
  return this._parsers.get.apply(this, arguments);
};


/**
 * Add a new template `type` to Template by passing the singular
 * and plural names to be used for `type`.
 *
 * @param {String} `type` Name of the new type to add
 * @param {Object} `options`
 * @return {Object} `Template` to enable chaining.
 * @api public
 */

// Template.prototype.type = function(type, plural, options) {
//   var opts = extend({}, options);

//   if (typeof plural !== 'string') {
//     throw new Error('A plural form must be defined for: "' + type + '".');
//   }
//   this.cache[plural] = {};

//   Template.prototype[type] = function (patterns, options) {
//     return this[plural](patterns, options);
//   };

//   Template.prototype[plural] = function (patterns, options) {
//     if (!arguments.length) {
//       return this.cache[plural];
//     }
//     return this;
//   };

//   return this;
// };


/**
 * Expose `Template`
 *
 * @type {Class}
 */

module.exports = Template;

