'use strict';

/* deps: arr-flatten isobject has-values pick-first */
var lazy = require('lazy-cache')(require);
var flatten = lazy('arr-flatten');
var isObject = lazy('isobject');
var notEmpty = lazy('has-values');
var pick = lazy('pick-first');
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
 * Cast val to an array.
 */
utils.arrayify = function arrayify(val) {
  return Array.isArray(val) ? val : [val];
};

utils.get = function get(options, prop) {
  return pick()(options || {}, prop);
};

utils.isOptions = function isOptions(val) {
  return val && isObject(val) && (val.viewType || val.loaderType || val.plural);
};

utils.isStream = function isStream (val) {
  if (typeof val === 'undefined') {
    throw new TypeError('utils.isStream expects val to not be undefined.');
  }
  return val && typeof val === 'object' && typeof val.pipe === 'function';
};

utils.isPromise = function isPromise (val) {
  if (typeof val === 'undefined') {
    throw new TypeError('utils.isPromise expects val to not be undefined.');
  }
  if (typeof val !== 'object' && typeof val !== 'function') {
    return false;
  }
  return typeof val.then === 'function';
};

utils.siftArgs = function siftArgs(opts, stack) {
  stack = [].slice.call(arguments);
  opts = isObject()(opts) ? stack.shift(): {};
  return {opts: opts, stack: flatten()(stack)};
};

utils.filterLoaders = function filterLoaders(cache) {
  return function() {
    var args = [].slice.call(arguments);
    var res = {rest: [], stack: []};
    var len = args.length;
    while (len--) {
      var arg = args[len];
      if (len > 0 && utils.isLoader(arg, cache)) {
        res.stack.unshift(arg);
      } else {
        res.rest.unshift(arg);
      }
    }
    res.stack = flatten()(res.stack.filter(notEmpty()));
    res.rest = res.rest.filter(notEmpty());
    if (res.rest.length > 1 && isObject()(res.rest[res.rest.length - 1])) {
      res.opts = res.rest.pop();
    }
    return res;
  };
};

utils.isLoader = function isLoader(val, cache) {
  return (cache && typeof val === 'string' && cache[val])
    || typeof val === 'function'
    || utils.isStream(val)
    || Array.isArray(val);
};

utils.loadersIndex = function loadersIndex(args) {
  var len = args.length;
  while (len--) {
    if (len === 0 && Array.isArray(args[len])) {
      return -1;
    }
    if (!utils.isLoader(args[len])) {
      return len + 1;
    }
  }
  return -1;
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
