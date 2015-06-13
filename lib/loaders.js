'use strict';

var flatten = require('arr-flatten');
var isObject = require('isobject');
var LoaderCache = require('loader-cache');
var iterators = require('./iterators');
var loaders = require('./loaders/last');

function Loaders(options, stack) {
  if (!isObject(options)) {
    stack = options;
    options = {};
  }
  defineGetter(this, 'loaders', {});
  defineGetter(this, '_', {});
  this._.options = options || {};
  this._.loaders = {};
  this._.name = options.name;
  this.loaderType('async');
  this.loaderType('promise');
  this.loaderType('stream');
  this.loaderType('sync');
}

mixin('loaderType', function (type) {
  this.loaders[type] = {};
  this._.loaders[type] = new LoaderCache({
    iterator: iterators[type],
    cache: this.loaders[type],
  });
  this._.loaders[type].register('last', loaders(this)[type]);
});

mixin('getType', function (opts) {
  if (typeof opts === 'string') return opts;
  return opts.loaderType || 'sync';
});

mixin('getLoader', function (opts) {
  var type = this.getType(opts);
  return this._.loaders[type];
});

mixin('load', function (args, opts, stack) {
  var loader = this.getLoader(opts);
  var type = this.getType(opts);
  var done = type === 'async' ? stack.pop() : null;
  stack = flatten(stack.concat('last'));
  var loaders = loader.buildStack(stack, loader.cache);
  if (type === 'async') {
    args = args.concat(done);
  }
  var load = loader.compose(loaders.stack);
  var res = load.apply(this, args);
  if (type !== 'stream') return res;
  res.on('error', function (err) {
    console.log('Loaders#loadStream: .%s, %j, %j', this._.name, err, args);
  });
  return res;
});

/**
 * Mix a getter onto the Loaders prototype
 *
 * @param  {String} `name`
 * @param  {Function} `getter`
 * @return {Getter}
 */
function mixin(name, value) {
  defineGetter(Loaders.prototype, name, value);
}

/**
 * Utility method to define getters.
 *
 * @param  {Object} `obj`
 * @param  {String} `name`
 * @param  {Function} `getter`
 * @return {Getter}
 */
function defineGetter(obj, name, value) {
  Object.defineProperty(obj, name, {
    configurable: true,
    get: function () {
      return value;
    },
    set: function () {
      throw new Error('Template.views[*].' + name + ' is a read-only property.');
    }
  });
}

/**
 * Expose `Loaders`
 */
module.exports = Loaders;
