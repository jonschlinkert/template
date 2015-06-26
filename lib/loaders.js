'use strict';

var extend = require('extend-shallow');
var Emitter = require('component-emitter');
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
    this[name] = this[name] || [];
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

  setLoaderType: function(type) {
    if (this.types.indexOf(type) === -1) {
      this.types.push(type);
    }
  },

  getLoaderType: function(options) {
    var opts = extend({loaderType: this.defaultType}, options);
    var type = opts.loaderType || 'sync';
    if (!this[type]) {
      throw new Error('LoaderCache: invalid loader type: ' + type);
    }
    return type;
  },

  /**
   * Resolve all loaders and loader names to their
   * function values.
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
    var args = utils.slice(arguments, 1);
    var opts = args.shift();

    var type = this.getLoaderType(opts);
    opts.loaderType = type;

    var inst = this[type];
    var iterator = this.iterator(type);

    stack = this.resolve(this.get(name).concat(args));
    var ctx = { app: this };
    ctx.options = opts;
    ctx.iterator = inst.iterator;
    ctx.loaders = inst;

    return function () {
      var args = [].slice.call(arguments).filter(Boolean);
      var len = args.length, loaders = [];

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

      stack = this.resolve(stack);
      stack = stack.map(opts.wrap || utils.noop);

      // create the actual `load` function
      var load = iterator.call(this, stack);
      return load.apply(ctx, args);
    }.bind(this);
  }
});


/**
 * Expose `Loaders`
 */

module.exports = Loaders;
