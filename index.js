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
var loaders = require('./lib/loaders/last');
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
  this.loaders[type] = this.loaders[type] || {};
  this._.loaders[type] = new LoaderCache({
    cache: this.loaders[type],
  });
};

Template.prototype.getLoaders = function(opts) {
  if (typeof opts === 'string') opts = {type: opts};
  var type = opts && (opts.type || opts.loaderType) || 'sync';
  return this._.loaders[type];
};

/**
 * Register a loader.
 *
 * @param  {String} `name` Loader name.
 * @param  {String} `options`
 * @param  {Array|Function} `stack` One or more loaders.
 * @return {Object} `Template` for chaining
 */
Template.prototype.loader = function(name, opts, stack) {
  var args = utils.siftArgs.apply(this, [].slice.call(arguments, 1));
  this.getLoaders(args.opts).register(name, args.stack);
  return this;
};

Template.prototype.buildStack = function(type, stack) {
  return flatten(stack).map(function (name) {
    return this.loaders[type][name] || name;
  }.bind(this));
};

Template.prototype.create = function(singular, options, stack) {
  var plural = this.inflect(singular);

  var args = [].slice.call(arguments, 1);
  var opts = isObject(options) ? args.shift(): {};
  this.options.views[plural] = opts;
  stack = flatten(args);

  this.views[plural] = new Collection(opts, stack);
  this.decorate(singular, plural, opts, stack);
  return this;
};

Template.prototype.decorate = function(singular, plural, options, loaders) {
  var opts = extend({plural: plural}, options);

  var load = function(key, value, locals, options) {
    var filter = utils.filterLoaders(this.loaders[type]);
    var args = filter.apply(filter, arguments);
    args.opts = extend({}, opts, args.opts);
    var type = args.opts.loaderType || 'sync';
    var base = this.buildStack(type, loaders);
    args.stack = this.buildStack(type, base.concat(args.stack));
    return this.views[plural].load(args);
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
