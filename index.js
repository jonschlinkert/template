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

Template.prototype.siftArgs = function(opts, stack) {
  stack = [].slice.call(arguments);
  opts = isObject(opts) ? stack.shift(): {};
  return {opts: opts, stack: flatten(stack)};
};
Template.prototype.getLoader = function(opts) {
  opts = opts || {};
  opts.type = (opts.type || opts.loaderType) ? opts.type : 'sync';
  return this._.loaders[opts.type];
};

Template.prototype.loader = function(name, opts, stack) {
  var args = this.siftArgs.apply(this, [].slice.call(arguments, 1));
  this.getLoader(args.opts).register(name, args.stack);
  return this;
};

Template.prototype.getStack = function(opts, stack) {
  var args = this.siftArgs.apply(this, arguments);
  var type = args.opts.type || args.opts.loaderType;

  return args.stack.map(function (loader) {
    return this.loaders[opts.type][loader];
  }.bind(this))
};

Template.prototype.create = function(singular, options, stack) {
  var plural = this.inflect(singular);
  if (!isObject(options)) {
    stack = options;
    options = {};
  }
  options = extend({name: plural}, options);
  this.views[plural] = new Collection(options, stack);
  this.decorate(singular, plural, options, stack);
};

Template.prototype.decorate = function(singular, plural, options, stack) {
  stack = this.stack[plural] = [];
  if (arguments.length > 2) {
    stack = [].slice.call(arguments, 2);
  }

  var opts = this.options.views[plural] = isObject(stack[0]) ? stack.shift() : {};
  var type = opts.loaderType || 'sync';

  var load = function(options, loaders) {
    loaders = [].slice.call(arguments);
    options = isObject(options) ? loaders.shift() : {};
    options.type = options.loaderType || type;

    loaders = this.getStack(options, loaders.concat(stack));
    this.views[plural].createLoader(options, loaders);
    return this.views[plural];
  };

  // template.pages({}, ['a', 'b', 'c']);
  this.mixin(plural, load);
  this.mixin(singular, load);
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
