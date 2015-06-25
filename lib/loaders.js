'use strict';

var fs = require('fs');
var path = require('path');
var Emitter = require('component-emitter');
var extend = require('extend-shallow');
var glob = require('globby');
var utils = require('./utils');

/**
 * Create an instance of `Loaders` with the given `options`.
 *
 * @param {Object} `options`
 */

function Loaders(options) {
  Emitter.call(this);
  this.options = options || {};
  this.iterators = this.iterators || {};
}

Loaders.prototype = Emitter({

  /**
   * Add a new `Iterator` to the instance.
   */

  iterator: function (name, fn) {
    if (arguments.length === 1) {
      return this.iterators[name];
    }
    this.iterators[name] = fn;
    return this;
  },

  /**
   * Add a new `Iterator` to the instance.
   */

  createStack: function (name) {
    if (typeof name !== 'string') return;
    if (!this.hasOwnProperty(name)) {
      this[name] = {};
      this[name].stack = this[name].stack || [];
      this[name].first = this[name].first || [];
      this[name].last = this[name].last || [];
    }
  },

  /**
   * Add a new `Loader` to the instance.
   */

  loader: function(name, fns) {
    this.createStack(name);
    if (!fns) return this.resolve(this[name].stack);
    this[name].stack = this.union(name, [].slice.call(arguments, 1));
    return this;
  },

  getLoader: function (name) {
    var loader = this[name] ? this[name].stack : name;
    return loader;
  },

  union: function (name, fns) {
    this.createStack(name);
    return utils.union(this[name].stack, fns);
  },

  seq: function (name) {
    return this.iterator(this.resolve(name));
  },

  /**
   * Register the first loader for a loader stack.
   */

  first: function(name, fn) {
    this.createStack(name);
    if (!fn) return this[name].first;
    var stack = utils.arrayify([].slice.call(arguments, 1));
    this[name].first = this.resolve(stack);
    return this;
  },

  /**
   * Register the last loader for a loader stack.
   */

  last: function(name, fn) {
    this.createStack(name);
    if (!fn) return this[name].last;
    var stack = utils.arrayify([].slice.call(arguments, 1));
    this[name].last = this.resolve(stack);
    return this;
  },

  /**
   * Register the first loader for a loader stack.
   */

  resolve: function() {
    var args = utils.union([].slice.call(arguments));
    var res = [], self = this;

    function build(stack) {
      stack = self.getLoader(stack);
      var len = stack.length, i = 0;

      while (len--) {
        var val = self.getLoader(stack[i++]);
        if (Array.isArray(val)) {
          build(val, res);
        } else {
          res.push(val);
        }
      }
      return res;
    }
    return build(args);
  },

  compose: function(name, options, stack) {
    var args = [].slice.call(arguments, 1);
    var opts = !utils.isLoader(options) ? args.shift() : {};
    opts = extend({iterator: 'sync'}, opts);
    var type = opts.iterator;
    var thisArg = opts.thisArg || this;
    var iterator = this.iterators[type];

    stack = this.resolve(this.getLoader(name).concat(args));
    var ctx = {app: this, options: options};
    return function () {
      var args = [].slice.call(arguments).filter(Boolean);
      var len = args.length, loaders = [], cb = null;

      while (len-- > 1) {
        var arg = args[len];
        if (!utils.isLoader(arg)) break;
        loaders.unshift(args.pop());
      }

      // combine the `create` and collection stacks
      stack = stack.concat(this.resolve(loaders));

      // if loading is async, move the done function to args
      if (type === 'async') {
        args = args.concat(stack.pop());
      }

      // add first and last loaders
      stack.unshift(this[name].first);
      stack.push(this[name].last);
      stack = this.resolve(stack);

      // create the actual `load` function
      var load = iterator.call(ctx, stack);
      return load.apply(ctx, args);
    }.bind(this);
  }
});


/**
 * Expose `Loaders`
 */

module.exports = Loaders;
