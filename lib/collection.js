'use strict';

var util = require('util');
var flatten = require('arr-flatten');
var isObject = require('isobject');
var LoaderCache = require('loader-cache');
var iterators = require('./iterators');
var loaders = require('./loaders/last');
var View = require('./view');


function Collection(options, stack) {
  if (!isObject(options)) {
    stack = options;
    options = {};
  }
  defineGetter(this, 'options', options || {});
  defineGetter(this, 'name', options.name);
  defineGetter(this, 'stack', stack || []);
  defineGetter(this, 'loaders', {});

  defineGetter(this, '_', {});
  this._.loaders = {};

  this.loaderType('async');
  this.loaderType('promise');
  this.loaderType('stream');
  this.loaderType('sync');
}

defineGetter(Collection.prototype, 'getLoader', function(opts) {
  var type = (opts && opts.type) ? opts.type : 'sync';
  return this._.loaders[type];
});

defineGetter(Collection.prototype, 'loaderType', function(type) {
  this.loaders[type] = {};
  this._.loaders[type] = new LoaderCache({
    iterator: iterators[type],
    cache: this.loaders[type],
  });
  this.lastLoader(type, loaders[type]);
});

defineGetter(Collection.prototype, 'createLoader', function(opts, stack) {
  stack = [].slice.call(arguments);
  opts = isObject(opts) ? stack.shift(): {};
  stack = flatten(stack.concat('last')).filter(Boolean);
  this._.loader = this.getLoader(opts).compose(stack);
  this._.loader.type = opts.type;
  return this;
});

defineGetter(Collection.prototype, 'lastLoader', function(type, fn) {
  this._.loaders[type].register('last', fn(this));
});

defineGetter(Collection.prototype, 'load', function() {
  var name = this.name;
  if (typeof this._.loader === 'undefined') {
    throw new Error('Collection#load: .' + name + '() must be called before `.load()');
  }
  if (this._.loader.type === 'stream') {
    var args = [].slice.call(arguments);
    var stream = this._.loader.apply(this, args);
    stream.on('error', function (err) {
      console.log('Collection#load: .%s, %j, %j', name, err, args);
    });
    return stream;
  }
  this._.loader.apply(this, arguments);
  return this;
});

defineGetter(Collection.prototype, 'use', function(fn) {
  var res = fn(this);
  console.log('res:', res);
  return this;
});

defineGetter(Collection.prototype, 'find', function(key) {
  return this[key];
});

/**
 * Adds a non-enumerable property to the instance of Collection
 *
 * @param  {String}
 * @param  {Function}
 * @return {Function}
 */
Collection.prototype.mixin = function(name, fn) {
  return Object.defineProperty(this, name, {
    configurable: true,
    enumerable: false,
    value: fn
  });
};

/**
 * Utility method to define getters.
 *
 * @param  {Object} `obj`
 * @param  {String} `name`
 * @param  {Function} `getter`
 * @return {Getter}
 * @api private
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
};


/**
 * Expose `Collection`
 */
module.exports = Collection;
