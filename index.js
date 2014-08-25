/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var Layouts = require('layouts');
var matter = require('gray-matter');
var Engines = require('engine-cache');
var Parsers = require('parser-cache');
var Cache = require('config-cache');
var _ = require('lodash');
var extend = _.extend;


var Delimiters = require('delimiters');
var delimiters = new Delimiters();


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

  this._engines = new Engines();
  this._parsers = new Parsers();

  this.defaultConfig();
  this.initOptions();
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

Template.prototype.initOptions = function() {
  this.option('cwd', process.cwd());

  this.option('partialLayout', null);
  this.option('layout', null);
  this.option('layoutTag', 'body');

  this.option('delims', {});
  this.option('layoutDelims', ['{{', '}}']);

  this.addDelims('default', ['<%', '%>']);
  this.addDelims('es6', ['${', '}'], {
    interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
  });
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
  if (!this.layoutCache) {
    var opts = _.extend({}, this.options, options);

    this.layoutCache = new Layouts({
      locals: opts.locals,
      layouts: opts.layouts,
      delims: opts.layoutDelims,
      tag: opts.layoutTag
    });
  }
};


/**
 * Add an object of layouts to `cache.layouts`.
 *
 * @param {Arguments}
 * @return {Template} to enable chaining.
 * @api public
 */

Template.prototype.engine = function (ext, options, fn) {
  this._engines.register.apply(this, arguments);
  return this;
};


/**
 * Add an object of layouts to `cache.layouts`.
 *
 * @param {Arguments}
 * @return {Template} to enable chaining.
 * @api public
 */

Template.prototype.getEngine = function (ext) {
  return this._engines.get.apply(this, arguments);
};


module.exports = Template;


var template = new Template();
// console.log(template.engine)
