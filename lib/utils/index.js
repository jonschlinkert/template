'use strict';

var path = require('path');
var lazy = require('lazy-cache')(require);
var micromatch = lazy('micromatch');
var flatten = lazy('arr-flatten');
var isObject = lazy('isobject');
var setValue = lazy('set-value');
var getValue = lazy('get-value');
var extend = lazy('extend-shallow');
var typeOf = require('kind-of');
var reduce = require('object.reduce');

/**
 * Expose `utils`
 */

var utils = module.exports = require('export-files')(__dirname);

/**
 * Default router methods used in all Template instances
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
 * Properties to allow on the root of a template from vinyl file objects
 */

utils.vinylProps = [
  'base',
  'cwd',
  'engine',
  'history',
  'path',
  'relative'
];

/**
 * External libs
 */

utils.get = require('get-value');
utils.flatten = require('arr-flatten');
utils.isMatch = require('is-match');
utils.isObject = require('isobject');
utils.reduce = require('object.reduce');
utils.typeOf = require('kind-of');
utils.extend = require('extend-shallow');
utils.inflect = require('pluralize');
utils.omit = require('object.omit');
utils.forOwn = require('for-own');
utils.hasValues = require('has-values');


/**
 * Noop
 */

utils.noop = function noop(val) {
  return val;
};

/**
 * Default renameKey function
 */

utils.renameKey = function renameKey(app) {
  return function (fp, options) {
    var opts = extend()({}, app.options, options);
    var fn = opts.renameKey || path.basename;
    return fn(fp);
  };
};

/**
 * Add a non-enumerable property to `obj`
 *
 * @param  {Object} `obj`
 * @param  {String} `name`
 * @param  {Function} `val`
 */

utils.mixin = function mixin(obj, name, val) {
  return Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: false,
    value: val
  });
};


utils.toTemplate = function toTemplate(fn, file) {
  var keys = ['_contents', 'stat', 'history'];
  var res = {}, template = {};
  for (var key in file) {
    if (file.hasOwnProperty(key) && keys.indexOf(key) === -1) {
      res[key] = file[key];
    }
  }
  res.path = file.path;
  if (file.contents) {
    res.content = file.contents.toString();
  } else {
    res.contents = new Buffer(file.content);
  }
  template[file.path] = res;
  fn(res);
  return res;
};

/**
 * Return the first object with a key that matches
 * the given glob pattern.
 *
 * @param {Object} `object`
 * @param {String|Array} `patterns`
 * @param {Object} `options`
 * @return {Object}
 */

utils.matchKey = function matchKey(obj, patterns, options) {
  if (typeof obj === 'undefined') return null;
  var mm = micromatch();
  var keys = mm(Object.keys(obj), patterns, options);
  return obj[keys[0]];
};

/**
 * Return all objects with keys that match
 * the given glob pattern.
 *
 * @param {Object} `object`
 * @param {String|Array} `patterns`
 * @param {Object} `options`
 * @return {Object}
 */

utils.matchKeys = function matchKeys(obj, patterns, options) {
  var mm = micromatch();
  var keys = mm(Object.keys(obj), patterns, options).sort();
  var len = keys.length, i = 0;
  var res = {};

  while (len--) {
    var key = keys[i++];
    res[key] = obj[key];
  }
  return res;
};

/**
 * Concatenate and flatten multiple arrays, filtering
 * falsey values from the result set.
 *
 * @param {Array} `arrays` One or more arrays
 * @return {Array}
 */

utils.union = function union() {
  var arr = [].concat.apply([], [].slice.call(arguments));
  return flatten()(arr).filter(Boolean);
};

/**
 * Set a value on an object using array-dot-notation.
 *
 * @param  {Array|String} `prop` Object path.
 * @param  {Object} `val` The value to set.
 */

utils.setProp = function setProp(obj, prop, val) {
  prop = utils.arrayify(prop).join('.');
  setValue()(obj, prop, val);
  return this;
};

/**
 * Get a value from an object by passing an array of
 * property paths to be used as dot notation.
 *
 * @param  {Object} `obj` The object to get a value from.
 * @param  {Array|String} `prop` Object path.
 */

utils.getProp = function getProp(obj, prop) {
  prop = utils.arrayify(prop).join('.');
  return getValue()(obj, prop);
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
 * Delegate late-bound methods onto the `receiver` instance,
 * which will later be invoked in the context of the receiver.
 */

utils.delegateEach = function delegateEach(receiver, provider, methods) {
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

utils.forwardEach = function forwardEach(receiver, provider, methods) {
  methods.forEach(function (method) {
    receiver[method] = receiver[method] || function () {
      return provider[method].apply(provider, arguments);
    };
  });
  return receiver;
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

utils.methodName = function methodName(method, name) {
  return utils.camelcase(method)
    + name.charAt(0).toUpperCase()
    + name.slice(1);
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
 * Cast val to an array.
 */

utils.arrayify = function arrayify(val) {
  return Array.isArray(val) ? val : [val];
};

utils.isOptions = function isOptions(val) {
  return val && isObject(val) && (val.viewType || val.loaderType || val.plural);
};

/**
 * Return true if the given value is a loader.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isLoader = function isLoader(val) {
  return typeof val === 'function'
    || utils.isStream(val)
    || utils.isPromise(val)
    || Array.isArray(val);
};

/**
 * Return true if the given object is a stream.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isStream = function isStream (val) {
  if (typeof val === 'undefined') {
    throw new TypeError('utils.isStream expects val to not be undefined.');
  }
  return val && typeof val === 'object' && typeof val.pipe === 'function';
};

/**
 * Return true if the given object is a promise.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isPromise = function isPromise (val) {
  if (typeof val === 'undefined') {
    throw new TypeError('utils.isPromise expects val to not be undefined.');
  }
  if (typeof val !== 'object' && typeof val !== 'function') {
    return false;
  }
  return typeof val.then === 'function';
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
 * Sanitize an array of file extensions. Strips the dot and
 * ensures they can be converted to regex or glob patterns.
 *
 * This is used by the `extensionRe()` util for creating
 * a regex to match the given file extensions.
 *
 * @param  {Array} `extensions` Array of file extensions
 * @return {Array}
 * @api public
 */

utils.exts = function exts(arr) {
  if (!Array.isArray(arr)) throw new Error('utils.exts() expects an array.');
  return arr.reduce(function (acc, ext) {
    if(ext !== '.*') {
      return acc.concat(utils.stripDot(ext));
    }
    return acc;
  }, []);
};

/**
 * Create a glob pattern for an array of file extensions.
 *
 * @param  {Array} `exts` Array of file extensions
 * @return {String} Glob pattern
 * @api public
 */

utils.extsPattern = function extsPattern(exts) {
  var arr = utils.union(utils.exts(exts));
  if (arr.length === 1) return '.' + arr[0];
  return '.{' + arr.join('|') + '}';
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


/**
 * Validate that the given `view` is an object with `path` and `content`
 * properties.
 *
 * @param  {Object} `view`
 * @param  {Function} `next` Optional callback
 * @return {}
 */

utils.validate = function validate(view, next) {
  var error;
  if (typeOf(view) !== 'object') {
    error = this.error('validate', 'views are expected to be objects.');
    if (next) return next(error);
    throw error;
  }

  if (!view.path) {
    error = this.error('validate', 'view.path must be a string.');
    if (next) return next(error);
    throw error;
  }

  if (typeOf(view.content) !== 'string') {
    error = this.error('validate', 'view.content must be a string.');
    if (next) return next(error);
    throw error;
  }

  if (typeof next === 'function') {
    next();
  }
};
