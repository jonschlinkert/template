'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var typeOf = require('kind-of');
var reduce = require('object.reduce');
var extend = require('extend-shallow');
var debug = require('./debug');

/**
 * Default router methods used in all Template instances
 * @api private
 */

exports.methods = ['onLoad', 'before', 'after'];

/**
 * Get the name of the layout to use for the given `template`.
 *
 * @param  {Object} `template` Template object to search for `layout`.
 * @param  {Object} `locals` Locals object search if not found on `template.`
 * @return {String} The name of the layout to use.
 * @api private
 */

exports.getLayout = function (template, locals) {
  debug.utils('[utils] getting layout: %j', template);

  var o = extend({}, template, locals);
  o = extend({}, o, o.options, o.data);

  return o.layout;
};

/**
 * Bind a `thisArg` to all the functions on the target
 *
 * @param  {Object|Array} `target` Object or Array with functions as values that will be bound.
 * @param  {Object} `thisArg` Object to bind to the functions
 * @return {Object|Array} Object or Array with bound functions.
 */

exports.bindAll = function (target, thisArg) {
  if (Array.isArray(target)) {
    return target.map(function (fn) {
      return fn.bind(thisArg);
    });
  }
  return reduce(target, function (acc, fn, key) {
    acc[key] = fn.bind(thisArg);
    return acc;
  }, {});
};

/**
 * Ensure file extensions are formatted properly for lookups.
 *
 * @param {String} `ext` File extension
 * @return {String}
 * @api private
 */

exports.formatExt = function(ext) {
  if (ext && ext[0] !== '.') {
    ext = '.' + ext;
  }
  return ext;
};

/**
 * Get a file extension, without the dot.
 *
 * @param {String} `fp` File path
 * @return {String}
 * @api private
 */

exports.getExt = function(fp) {
  return path.extname(fp).slice(1);
};

/**
 * Extend the `to` object with the method on the `from` object.
 *
 * @param  {Object} `to` Object to add the method to.
 * @param  {Object} `from` Object to get the method from.
 * @param  {Object} `toProp` method name to add to the `to` object
 * @param  {Object} `fromProp` method name on the from object.
 * @api private
 */

exports.mixInLoaders = function (to, from) {
  return function (toProp, fromProp) {
    fromProp = fromProp || toProp;
    to[toProp] = function () {
      return from[fromProp].apply(from, arguments);
    };
  };
};

/**
 * Find any items in the array that match the specified types.
 *
 * @param  {Array}        `arr` Array to search
 * @param  {Array|String} `types` Types to find
 * @return {Array}        Filtered array.
 * @api private
 */

exports.filter = function (arr, types) {
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
