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
var LoaderCache = require('loader-cache');
var Collection = require('./lib/collection');

function Template() {
  this.options = {};
  this.inflection = {};
  this.loaders = {};
  this.stack = {};
  this.views = {};

  this._ = {};
  this._.loaders = {};

  this.loaderType('sync');
  this.loaderType('async');
  this.loaderType('promise');
  this.loaderType('stream');
}

Template.prototype.create = function(singular, options, loaders) {
  this.decorate(singular, this.inflect(singular), options, loaders);
};

/**
 * Create a getter function that can either returns
 *  - a function that can be called as a function to pass in `options`, or
 *  - can be used as a property that has all of the `Collection` methods and properties on it.
 */

function buildCollection (plural, options) {
  var collection = null;
  var getter = function() {
    if (collection == null) {
      collection = new Collection(options, this.views[plural]);
    }
    function compose(stack, options) {
      // compose the loader function to use for loading
      // items onto this collection
      this.options[plural] = options || {};
      return collection;
    };
    var self = this;
    var fn = function() {
      return compose.apply(self, arguments);
    };
    fn.__proto__ = collection;
    return fn;
  };
  return getter;
}

Template.prototype.create = function(subtype, options) {
  var plural = inflect(subtype);
  this.views[plural] = this.views[plural] || {};

  // Add a new getter property to `this` to ensure only this instance
  // is changed.
  Object.defineProperty(this, plural, {
    get: buildCollection.call(this, plural, options)
  });
};

Template.prototype.decorate = function(singular, plural, options, loaders) {
  this.views[plural] = new Collection({name: plural});

  var args = [].slice.call(arguments, 2);
  var opts = this.options[plural] = isObject(args[0]) ? args.shift() : {};
  var stack = this.stack[plural] = args.filter(Boolean);
  var type = opts.loaderType || 'sync';
  var load = this.loaders[type];

  // this still isn't right...
  this.mixin(plural, function(options, stack) {
    var args = [].slice.call(arguments);
    var opts = isObject(options) ? args.shift() : {};

    this.views[plural].load(this.compose.apply(this, arguments));
    return this;
  });

  this.mixin(singular, function(options, stack) {
    this.views[plural].load(this.compose.apply(this, arguments));
    return this;
  });
};

Template.prototype.inflect = function(name) {
  return this.inflection[name] || (this.inflection[name] = inflect(name));
};

Template.prototype.loaderType = function(type) {
  this._.loaders[type] = new LoaderCache({cache: this.loaders[type]});
};

Template.prototype.filterArgs = function(name) {
  var args = [].slice.call(arguments, 1);
  var opts = isObject(args[0]) ? args.shift() : {};
  return {name: name, opts: opts, stack: args};
};

Template.prototype.loader = function(opts, stack) {
  var args = this.filterArgs.apply(this, arguments);
  var type = args.opts.type || 'sync';
  console.log(args)
  return this._.loaders[type].register(args.name, args.stack);
};

Template.prototype.compose = function(opts, stack) {
  var args = this.filterArgs.apply(this, arguments);
  var type = args.opts.type || 'sync';
  var load = this._.loaders[type]
  return load.compose.apply(load, arguments);
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

var template = new Template();
template.loader('read', {type: 'stream'}, function() {});
template.loader('glob', {type: 'sync'}, function() {});
template.loader('github', {type: 'async'}, function() {});

template.create('page', {loaderType: 'stream'});
template.create('layout', {loaderType: 'promise'});
template.create('partial', {loaderType: 'async'});
template.create('include', ['foo', 'bar', 'baz']);
// template.pages('a', {contents: 'this is contents'});
// template.pages('b', {contents: 'this is contents'});
template.pages({}).load();
template.pages({});
// template.pages.load()
console.log(template)
// console.log(template.pages('a').contents.toString())

// template.pages({}, ['foo', 'bar']).src('abc/*.hbs')
//   .pipe(one())
//   .pipe(two())
//   .pipe(template.pages.dest())
