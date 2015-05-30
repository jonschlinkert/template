'use strict';

/**
 * Module dependencies
 */

var typeOf = require('kind-of');
var reduce = require('object.reduce');

/**
 * Expose `utils`
 */

var utils = module.exports;

/**
 * Default router methods used in all Template instances
 * @api private
 */

utils.methods = [
  'onLoad',
  'preCompile',
  'postCompile',
  'preRender',
  'onRender',
  'postRender'
];

/**
 * Detect if the user has specfied not to render a vinyl template.
 *
 * @return {Boolean}
 */

utils.norender = function norender(app, ext, file, locals) {
  return !app.engines.hasOwnProperty(ext)
    || app.isTrue('norender') || app.isFalse('render')
    || file.norender === true || file.render === false
    || locals.norender === true || locals.render === false;
};

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

utils.methodName = function methodName(method, type) {
  return utils.camelcase(method)
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

utils.bindAll = function bindAll(target, thisArg) {
  if (Array.isArray(target)) {
    for (var i = 0; i < target.length; i++) {
      target[i] = target[i].bind(thisArg);
    }
    return target;
  }
  return reduce(target, function (acc, fn, key) {
    if (typeof fn === 'object' && typeof fn !== 'function') {
      acc[key] = utils.bindAll(fn, thisArg);
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

utils.flattenProp = function flattenProp(prop, target/*, objects */) {
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

utils.forward = function forward(to, from) {
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

utils.delegate = function delegate(to, from, method) {
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

utils.hasOwn = function hasOwn(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
};

/**
 * Coerce val to an array.
 */

utils.arrayify = function arrayify(val) {
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

utils.filter = function filter(arr, types) {
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

utils.camelcase = function camelcase(str) {
  if (str.length === 1) { return str; }
  str = str.replace(/^[-_.\s]+/, '').toLowerCase();
  return str.replace(/[-_.]+(\w|$)/g, function (_, ch) {
    return ch.toUpperCase();
  });
};

/**
 * Ensure file extensions are formatted properly for lookups.
 *
 * ```js
 * utils.formatExt('hbs');
 * //=> '.hbs'
 *
 * utils.formatExt('.hbs');
 * //=> '.hbs'
 * ```
 *
 * @param {String} `ext` File extension
 * @return {String}
 * @api public
 */

utils.formatExt = function formatExt(ext) {
  if (typeof ext !== 'string') {
    throw new Error('formatExt() expects `ext` to be a string.');
  }
  if (ext.charAt(0) !== '.') {
    return '.' + ext;
  }
  return ext;
};


/**
 * Strip the dot from a file extension
 *
 * ```js
 * utils.stripDot('.hbs');
 * //=> 'hbs'
 * ```
 *
 * @param {String} `ext` extension
 * @return {String}
 * @api public
 */

utils.stripDot = function stripDot(ext) {
  if (typeof ext !== 'string') {
    throw new Error('utils.stripDot() expects `ext` to be a string.');
  }
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
 * @api public
 */

utils.exts = function exts(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('utils.exts() expects an array.');
  }
  return arr.map(function (ext) {
    if(ext === '.*') return '$';
    return utils.stripDot(ext);
  });
};

/**
 * Creates a regex to match only the file extensions of registered
 * engines.
 *
 * This is used by the default middleware to prevent unregistered
 * extensions from being processed.
 *
 * @param  {String} `str`
 * @return {RegExp}
 * @api public
 */

utils.extensionRe = function extensionRe(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('utils.extensionRe() expects an array.');
  }
  return new RegExp('(?:' + utils.exts(arr).join('|') + ')$');
};
