'use strict';

var isObject = require('isobject');
var extend = require('extend-shallow');
var arrayify = require('arrayify-compact');
var union = require('arr-union');
var utils = require('./utils');

/**
 * Create a new instance of `Loaders`.
 *
 * ```js
 * var Loaders = require('loader-cache');
 * var loaders = new Loaders();
 * ```
 * @api public
 */

function Loaders(options, loaders) {
  if (!(this instanceof Loaders)) {
    return new Loaders(options, loaders);
  }
  this.options = options || {};
  this.iterators = this.options.iterators || {};
  this.loaders = this.options.loaders || [];
}

/**
 * Loaders methods
 */

Loaders.prototype = {

  /**
   * Get a loader of the given `type` and `name`
   *
   * @param {String} `type`
   * @api public
   */

  get: function(type, name) {
    return this.loaders[type] ? this.loaders[type][name] : null;
  },

  /**
   * Add a loader type.
   *
   * @param {String} `type`
   * @api public
   */

  loaderType: function(type) {
    return this.loaders[type] || (this.loaders[type] = {});
  },

  /**
   * Add a new `Iterator` to the instance.
   *
   * @param {String} `name`
   * @param {Function} `fn`
   * @api public
   */

  iterator: function(type, opts, fn) {
    this.iterators[type] = new Iterator(opts, fn);
    return this;
  },

  /**
   * Create a new loader stack with the given `name` and `options`.
   *
   * @param {String} `name`
   * @param {Options} `opts`
   * @return {Array} Returns the loader stack.
   */

  // stack: function(type, name, loaders) {
  //   return this.get(type, name) || (this.loaders[type][name] = new LoaderStack(loaders));
  // },

  /**
   * Register a loader.
   *
   * @param {String} `name`
   * @param {Function} `fn`
   * @api public
   */

  // loader: function(name, opts, stack) {
  //   return this.stack(name, !utils.isLoader(opts) ? opts : {}).push(stack || opts);
  // }
};



/**
 * Expose `Loader`
 */

module.exports = Loaders;


// var loaders = new Loaders();

// loaders.loader('a', function () {

// });

// loaders.loader('a', function () {

// });


// var loaders = new LoaderType();

// loaders.loader('a', function a() {});
// loaders.loader('a', function b() {});
// loaders.loader('b', ['a'], function c() {});

// console.log(loaders)


  // var stack = this.resolve([].slice.call(arguments));

function compose(stack) {
  return function (arg) {
    var len = stack.length, i = -1;
    while (len--) {
      var fn = stack[len];
      if (++i === 0) {
        arg = fn.apply(this, arguments);
      } else {
        arg = fn.call(this, arg);
      }
    }
    return arg;
  };
}
