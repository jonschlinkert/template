'use strict';

var reduce = require('object.reduce');

/**
 * Expose functions `utils`
 */

var utils = module.exports;

/**
 * Noop
 */

utils.noop = function noop(val) {
  return val;
};

/**
 * Delegate late-bound methods onto the `receiver` instance,
 * which will later be invoked in the context of the receiver.
 */

utils.delegate = function delegate(receiver, provider, methods) {
  methods.forEach(function (method) {
    receiver[method] = function () {
      return provider[method].apply(receiver, arguments);
    };
  });
  return receiver;
};

/**
 * Forward late-bound methods onto the `receiver` instance,
 * which will later be invoked in the context of the provider.
 */

utils.forward = function forward(receiver, provider, methods) {
  methods.forEach(function (method) {
    receiver[method] = function () {
      return provider[method].apply(provider, arguments);
    };
  });
  return receiver;
};

/**
 * Partially apply arguments that are prepended to the arguments provided
 * to the returned function.
 *
 * @param  {Function} `fn`
 * @return {Function}
 */

utils.partial = function partial(ctx, fn/*, arguments*/) {
  var leftArgs = [].slice.call(arguments, 2);
  return function () {
    var args = leftArgs.concat([].slice.call(arguments));
    return fn.apply(ctx, args);
  }.bind(ctx);
};

/**
 * Partially apply arguments that are appended to the arguments provided
 * to the returned function.
 *
 * @param  {Function} `fn`
 * @return {Function}
 */

utils.partialRight = function partialRight(ctx, fn/*, arguments*/) {
  var rightArgs = [].slice.call(arguments, 2);
  return function () {
    var args = [].slice.call(arguments).concat(rightArgs);
    return fn.apply(ctx, args);
  }.bind(ctx);
};

/**
 * Bind a `thisArg` to all the functions on the target
 *
 * @param  {Object|Array} `target` Object or Array with functions as values that will be bound.
 * @param  {Object} `thisArg` Object to bind to the functions
 * @return {Object|Array} Object or Array with bound functions.
 */

utils.bindAll = function bindAll(target, thisArg) {
  if (Array.isArray(target)) {
    return utils.bindEach(target, thisArg);
  }
  return reduce(target, function (acc, fn, key) {
    if (typeof fn === 'object' && typeof fn !== 'function') {
      acc[key] = utils.bindAll(fn, thisArg);
    } else {
      acc[key] = fn.bind(thisArg);
      if (fn.async) {
        acc[key].async = fn.async;
      }
    }
    return acc;
  }, {});
};

utils.bindEach = function bindEach(target, thisArg) {
  for (var i = 0; i < target.length; i++) {
    target[i] = target[i].bind(thisArg);
  }
  return target;
};
