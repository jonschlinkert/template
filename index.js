/*!
 * next-next <https://github.com/jonschlinkert/next-next>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');
var extend = require('extend-shallow');
var inflect = require('pluralize');
var flatten = require('arr-flatten');
var LoaderCache = require('loader-cache');
var Collection = require('./lib/collection');
var iterators = require('./lib/iterators');
var utils = require('./lib/utils');

function Template() {
  this.options = {};
  this.inflection = {};
  this.loaders = {};
  this.stack = {};

  this.views = {};
  this.options.views = {};

  this._ = {};
  this._.loaders = {};

  this.loaderType('sync');
  this.loaderType('async');
  this.loaderType('promise');
  this.loaderType('stream');
}

Template.prototype.loaderType = function(type) {
  this.loaders[type] = {};
  this._.loaders[type] = new LoaderCache({
    cache: this.loaders[type],
  });
};

Template.prototype.getLoader = function(opts) {
  opts = opts || {};
  if (typeof opts.type === 'undefined') {
    opts.type = opts.loaderType || 'sync';
  }
  return this._.loaders[opts.type];
};

Template.prototype.loader = function(name, opts, stack) {
  var args = utils.siftArgs.apply(this, [].slice.call(arguments, 1));
  this.getLoader(args.opts).register(name, args.stack);
  return this;
};

Template.prototype.getStack = function(opts, stack) {
  var args = utils.siftArgs.apply(this, arguments);
  var type = args.opts.type || args.opts.loaderType;

  return args.stack.map(function (loader) {
    return this.loaders[opts.type][loader];
  }.bind(this))
};

Template.prototype.create = function(singular, options, stack) {
  var plural = this.inflect(singular);
  var args = [].slice.call(arguments, 1);
  var opts = isObject(options) ? args.shift(): {};
  stack = flatten(args);

  this.options.views[plural] = opts;
  this.views[plural] = new Collection(opts, stack);
  this.stack[plural] = stack;

  this.decorate(singular, plural, opts, stack);
};

Template.prototype.decorate = function(singular, plural, options, stack) {
  var opts = extend({name: plural}, options);
  var type = opts.loaderType || 'sync';

  var load = function(key, value, locals, options) {
    var filter = utils.filterArgs();
    var result = filter.apply(filter, arguments);
    console.log(result)
    this.views[plural].createLoader.apply(this.views[plural], result.args);
    return this.views[plural];
  };

  this.mixin(singular, load);
  this.mixin(plural, load);
};

Template.prototype.inflect = function(name) {
  return this.inflection[name] || (this.inflection[name] = inflect(name));
};

/**
 * Adds a non-enumerable property to the instance of Template
 *
 * @param  {String}
 * @param  {Function}
 * @return {Function}
 */
Template.prototype.mixin = function(name, fn) {
  return Object.defineProperty(this, name, {
    configurable: true,
    enumerable: false,
    value: fn
  });
};

/**
 * Expose `Template`
 */
module.exports = Template;
