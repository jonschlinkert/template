'use strict';

/**
 * Module dependencies
 */

var typeOf = require('kind-of');
var reduce = require('object.reduce');
var merge = require('mixin-deep');
var debug = require('./debug');

/**
 * Default router methods used in all Template instances
 * @api private
 */

exports.methods = ['onLoad', 'preCompile', 'postCompile', 'preRender', 'postRender'];

/**
 * Create a camel-cased method name for the given
 * `method` and `type`.
 *
 *     'get' + 'page' => `getPage`
 *
 * @param  {String} `type`
 * @param  {String} `name`
 * @return {String}
 */

exports.methodName = function methodName(method, type) {
  return exports.camelcase(method)
    + type.charAt(0).toUpperCase()
    + type.slice(1);
};

/**
 * Bind a `thisArg` to all the functions on the target
 *
 * @param  {Object|Array} `target` Object or Array with functions as values that will be bound.
 * @param  {Object} `thisArg` Object to bind to the functions
 * @return {Object|Array} Object or Array with bound functions.
 */

exports.bindAll = function bindAll(target, thisArg) {
  if (Array.isArray(target)) {
    for (var i = 0; i < target.length; i++) {
      target[i] = target[i].bind(thisArg);
    }
    return target;
  }
  return reduce(target, function (acc, fn, key) {
    if (typeof fn === 'object' && typeof fn !== 'function') {
      acc[key] = exports.bindAll(fn, thisArg);
    } else {
      acc[key] = fn.bind(thisArg);
      if (fn.async) acc[key].async = fn.async;
    }
    return acc;
  }, {});
};

/**
 * Flatten the given property from the given objects
 * to the root of the first object.
 *
 * @param  {String} `prop`
 * @param  {Object} `target`
 * @param  {Object} `objects` List of objects
 * @return {String}
 */

exports.flattenProp = function flattenProp(prop, target/*, objects */) {
  if (typeof prop !== 'string') {
    throw new TypeError ('flattenProp expects `prop` to be a string.');
  }
  var len = arguments.length - 1;
  for (var i = 0; i < len; i++) {
    var obj = arguments[i + 1];
    if (!obj.hasOwnProperty(prop)) {
      continue;
    }
    target[prop] = target[prop] || obj[prop];
  }
  return target;
};

/**
 * Forward `methods` from the `provider` object to the
 * `receiver` object, so that each method is invoked in the
 * provider's context.
 *
 * @param  {Object} `to` The object receiving the methods
 * @param  {Object} `from` The object providing the methods
 * @param  {Object} `toProp` method name to add to the `to` object
 * @param  {Object} `fromProp` method name on the from object.
 * @api private
 */

exports.forward = function forward(to, from) {
  return function (toProp, fromProp) {
    fromProp = fromProp || toProp;
    to[toProp] = function () {
      return from[fromProp].apply(from, arguments);
    };
  };
};

/**
 * Delegate `methods` from the `provider` object to the
 * `receiver` object, so that each method is invoked in the
 * receiver's context.
 *
 * @param  {Object} `to` The object receiving the methods
 * @param  {Object} `from` The object providing the methods
 * @param  {Array} `methods` Array of method names to delegate
 * @api private
 */

exports.delegate = function delegate(to, from, method) {
  to[method] = function () {
    return from[method].apply(to, arguments);
  };
  return to;
};

/**
 * Utility for getting an own property from an object.
 *
 * @param  {Object} `o`
 * @param  {Object} `prop`
 * @return {Boolean}
 * @api true
 */

exports.hasOwn = function hasOwn(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
};

/**
 * Coerce val to an array.
 */

exports.arrayify = function arrayify(val) {
  return Array.isArray(val) ? val : [val];
};

/**
 * Find any items in the array that match the specified types.
 *
 * @param  {Array}        `arr` Array to search
 * @param  {Array|String} `types` Types to find
 * @return {Array}        Filtered array.
 * @api private
 */

exports.filter = function filter(arr, types) {
  types = !Array.isArray(types)
    ? [types]
    : types;

  var len = arr.length;
  var res = [];

  for (var i = 0; i < len; i++) {
    var ele = arr[i];
    if (types.indexOf(typeOf(ele)) !== -1) {
      res.push(ele);
    }
  }
  return res;
};

/**
 * Camemlcase the given string.
 *
 * @param  {String} str
 * @return {String}
 */

exports.camelcase = function camelcase(str) {
  if (str.length === 1) { return str; }
  str = str.replace(/^[-_.\s]+/, '').toLowerCase();
  return str.replace(/[-_.]+(\w|$)/g, function (_, ch) {
    return ch.toUpperCase();
  });
};
