'use strict';

/**
 * Function utils.
 */

var utils = module.exports;

/**
 * Returns the first argument passed to the function.
 */

utils.identity = function identity(val) {
  return val;
};

/**
 * Partially applies arguments that are appended to those provided
 * to the new function.
 *
 * @param  {Object} `ctx` The invocation context for the returned function.
 * @param  {Function} `fn`
 * @return {Function}
 */

utils.partialRight = function partialRight(ctx, fn/*, arguments*/) {
  var rightArgs = [].slice.call(arguments, 2);
  return function () {
    var args = [].slice.call(arguments).concat(rightArgs);
    return fn.apply(ctx, args);
  };
};

