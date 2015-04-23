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

exports.methods = ['onLoad', 'preCompile', 'preRender', 'postRender'];

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
 * Get the name of the layout to use for the given `template`.
 *
 * @param  {Object} `template` Template object to search for `layout`.
 * @param  {Object} `locals` Locals object search if not found on `template.`
 * @return {String} The name of the layout to use.
 * @api private
 */

exports.getLayout = function getLayout(template, locals) {
  debug.utils('[utils] getting layout: %j', template);

  var o = merge({}, template, locals);
  o = merge({}, o, o.options, o.data);

  return o.layout;
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
    return target.map(function (fn) {
      return fn.bind(thisArg);
    });
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
 * Ensure file extensions are formatted properly for lookups.
 *
 * @param {String} `ext` File extension
 * @return {String}
 * @api private
 */

exports.formatExt = function formatExt(ext) {
  if (ext && ext.charAt(0) !== '.') {
    return '.' + ext;
  }
  return ext;
};

/**
 * Strip the dot from a file extension
 *
 * @param {String} `ext` extension
 * @return {String}
 * @api private
 */

exports.stripDot = function stripDot(ext) {
  if (ext.charAt(0) === '.') {
    return ext.slice(1);
  }
  return ext;
};

/**
 * Sanitize an array of extensions before converting
 * them to regex.
 *
 * This is used by the `extensionRe()` util for creating
 * a regex to match the given file extensions.
 *
 * @param  {Array} `extensions` Array of file extensions
 * @return {Array}
 */

exports.exts = function exts(extensions) {
  return extensions.map(function (ext) {
    if(ext === '.*') {
      ext = '$';
    } else {
      ext = exports.stripDot(ext);
    }
    return ext;
  });
};

/**
 * Creates a regex to match only the file extensions of registered
 * engines. This is used by the default middleware to prevent
 * unregistered extensions from being processed.
 */

exports.extensionRe = function extensionRe(str) {
  return new RegExp('(?:' + exports.exts(str).join('|') + ')$');
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

exports.mixInLoaders = function mixInLoaders(to, from) {
  return function (toProp, fromProp) {
    fromProp = fromProp || toProp;
    to[toProp] = function () {
      return from[fromProp].apply(from, arguments);
    };
  };
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
