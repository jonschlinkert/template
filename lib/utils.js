'use strict';

var path = require('path');
var isObject = require('is-extendable');
var extend = require('extend-shallow');

/**
 * Lazily required modules
 */

var lazy = require('lazy-cache')(require);
var flatten = lazy('arr-flatten');
var reduce = lazy('object.reduce');
var mm = lazy('micromatch');

/**
 * Expose `utils`
 */

var utils = module.exports;

/**
 * Expose `isObject` lib
 */

utils.isObject = isObject;

/**
 * Properties to allow on the root of a template from vinyl file objects
 */

utils.vinylProps = [
  'base',
  'contents',
  'content',
  'history',
  'path',
  'relative'
];

/**
 * Default router methods used in all Template instances
 */

utils.methods = [
  'onLoad',
  'preCompile',
  'preLayout',
  'onLayout',
  'postLayout',
  'onMerge',
  'postCompile',
  'preRender',
  'postRender'
];

/**
 * Format an error object.
 */

utils.error = function error(msg, val) {
  throw new Error(msg + JSON.stringify(val));
};

/**
 * Arrayify the given value by casting it to an array.
 */

utils.arrayify = function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Noop
 */

utils.noop = function noop() {
  return;
};

/**
 * Returns the first argument passed to the function.
 */

utils.identity = function identity(val) {
  return val;
};

/**
 * Class utils
 */

utils.setProto = function setProto(obj, proto) {
  return Object.setPrototypeOf
    ? Object.setPrototypeOf(obj, proto)
    : (obj.__proto__ = proto);
};

/**
 * Add a non-enumerable property to `receiver`
 *
 * @param  {Object} `obj`
 * @param  {String} `name`
 * @param  {Function} `val`
 */

utils.defineProp = function defineProp(receiver, key, value) {
  return Object.defineProperty(receiver, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: value
  });
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
 * Delegate non-enumerable properties from `provider` to `receiver`.
 *
 * @param  {Object} `receiver`
 * @param  {Object} `provider`
 */

utils.delegate = function delegate(receiver, provider) {
  for (var method in provider) {
    utils.defineProp(receiver, method, provider[method]);
  }
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
  return reduce()(target, function (acc, fn, key) {
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

/**
 * Return true if the given value is a loader.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isLoader = function isLoader(val, cache) {
  return typeof val === 'function'
    || cache && typeof val === 'string' && cache[val]
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
  return val && isObject(val) && typeof val.pipe === 'function';
};

/**
 * Return true if the given object is a promise.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isPromise = function isPromise (val) {
  return val && isObject(val) && typeof val.then === 'function';
};

/**
 * Rename each key in the give `obj`
 */

utils.rename = function rename(views, fn) {
  if (typeof fn !== 'function') {
    fn = path.basename;
  }
  for (var key in views) {
    if (views.hasOwnProperty(key)) {
      views[fn(key)] = views[key];
      delete views[key];
    }
  }
};

/**
 * Matching utils
 * ------------------------------------
 */

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
  var keys = mm()(Object.keys(obj), patterns, options);
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
  var keys = mm()(Object.keys(obj), patterns, options).sort();
  var len = keys.length, i = 0;
  var res = {};

  while (len--) {
    var key = keys[i++];
    res[key] = obj[key];
  }
  return res;
};



/**
 * Arguments utils
 * ------------------------------------
 */

/**
 * Separate args from options. Returns an array with
 * two elements, where the first element is options
 * and the second an array of arguments.
 */

utils.slice = function slice(arr, i) {
  var args = [].slice.call(arr, i);
  var opts = {};
  if (!utils.isLoader(args[0])) {
    opts = args.shift();
  }
  var last = args[args.length - 1];
  if (isObject(last) && !utils.isLoader(last)) {
    extend(opts, args.pop());
  }
  opts = opts || {};
  return flatten()([opts, args]);
};

/**
 * Get locals from arguments.
 *
 * @param  {Object} locals
 * @param  {Object} options
 */

utils.getLocals = function getLocals(locals, options) {
  options = options || {};
  locals = locals || {};
  var ctx = {};

  if (options.hasOwnProperty('hash')) {
    extend(ctx, locals);
    extend(ctx, options.hash);

  } else if (locals.hasOwnProperty('hash')) {
    extend(ctx, locals.hash);

  } else if (!locals.hasOwnProperty('hash') && !options.hasOwnProperty('hash')) {
    extend(ctx, options);
    extend(ctx, locals);
  }
  return ctx;
};

