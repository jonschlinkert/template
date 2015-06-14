'use strict';

var flatten = require('arr-flatten');
var isObject = require('isobject');
var LoaderCache = require('loader-cache');
var iterators = require('./iterators');
var loaders = require('./loaders/last');

function Collection(options, stack) {
  if (!isObject(options)) {
    stack = options;
    options = {};
  }
  defineGetter(this, 'loaders', {});
  defineGetter(this, '_', {});
  this._.options = options || {};
  this._.loaders = {};
  this._.iterators = {};
  this._.name = options.name;
  this.init();
}

Collection.prototype.init = function(fn) {
  // iterator types
  this.iterator('async', iterators.async);
  this.iterator('promise', iterators.promise);
  this.iterator('stream', iterators.stream);
  this.iterator('sync', iterators.sync);

  // loader types
  this.loaderType('async');
  this.loaderType('promise');
  this.loaderType('stream');
  this.loaderType('sync');
};

Collection.prototype.use = function(fn) {
  fn(this);
  return this;
};

Collection.prototype.find = function(key) {
  return this[key];
};

Collection.prototype.iterator = function(type, fn) {
  this._.iterators[type] = fn;
  return this;
};

Collection.prototype.loaderType = function (type) {
  this.loaders[type] = {};
  this._.loaders[type] = new LoaderCache({
    iterator: this._.iterators[type],
    cache: this.loaders[type],
  });
  this._.loaders[type].register('last', loaders(this)[type]);
};

Collection.prototype.getType = function (opts) {
  if (typeof opts === 'string') return opts;
  return opts.loaderType || 'sync';
};

Collection.prototype.getLoader = function (opts) {
  var type = this.getType(opts);
  return this._.loaders[type];
};

Collection.prototype.load = function (args, opts, stack) {
  var loader = this.getLoader(opts);
  var type = this.getType(opts);
  var done = type === 'async' ? stack.pop() : null;
  stack = stack.concat('last');
  var loaders = loader.buildStack(stack, loader.cache);
  if (type === 'async') {
    args = args.concat(done);
  }
  var load = loader.compose(loaders.stack);
  var res = load.apply(this, args);
  if (type !== 'stream') return res;
  res.on('error', function (err) {
    console.log('Collection#loadStream: .%s, %j, %j', this._.name, err, args);
  });
  return res;
};

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
 * Expose `Collection`
 */
module.exports = Collection;
