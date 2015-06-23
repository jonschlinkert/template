'use strict';

var path = require('path');
var isObject = require('isobject');
var flatten = require('arr-flatten');
var extend = require('extend-shallow');
var reduce = require('object.reduce');

/**
 * Expose `utils`
 */

var utils = module.exports;

utils.flatten = flatten;
utils.isObject = isObject;

/**
 * Noop
 */

utils.noop = function noop(val) {
  return val;
};

/**
 * Default router methods used in all Template instances
 */

utils.methods = [
  'onLoad',
  'preCompile',
  'preLayout',
  'postLayout',
  'onMerge',
  'postCompile',
  'preRender',
  'postRender'
];

/**
 * Call `method` on each value in `obj`.
 *
 * @param  {Object} `thisArg` The context in which to invoke `method`
 * @param  {String} `method` Name of the method to call on `thisArg`
 * @param  {Object} `obj` Object to iterate over
 * @return {Object} `thisArg` for chaining.
 */

utils.visit = function visit(thisArg, method, obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      thisArg[method](key, obj[key]);
    }
  }
  return thisArg;
};

/**
 * Map `visit` over an array of objects.
 *
 * @param  {Object} `thisArg` The context in which to invoke `method`
 * @param  {String} `method` Name of the method to call on `thisArg`
 * @param  {Object} `arr` Array of objects.
 * @return {Object} `thisArg` for chaining.
 */

utils.mapVisit = function mapVisit(thisArg, method, arr) {
  arr.forEach(function (obj) {
    utils.visit(thisArg, method, obj);
  });
};

/**
 * Separate args from options. Returns an array with
 * two elements, where the first element is options
 * and the second an array of arguments.
 */

utils.args = function(obj) {
  var args = [].slice.call(obj, 1);
  var res = [{}];
  if (!utils.isLoader(args[0])) {
    res[0] = args.shift();
  }
  res.push(args);
  return res;
};

/**
 * Default renameKey function
 */

utils.renameKey = function renameKey(app) {
  return function (fp, options) {
    var opts = extend({}, app.options, options);
    var fn = opts.renameKey || path.basename;
    return fn(fp);
  };
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
    get: function () {
      return value;
    },
    set: function (val) {
      value = val;
    }
  });
};

utils.defineProps = function defineProps(obj, methods) {
  for (var key in methods) {
    utils.defineProp(obj, key, methods[key]);
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
 * Cast `val` to an array.
 */

utils.error = function error(msg, val) {
  throw new Error(msg + JSON.stringify(val));
};

/**
 * Cast `val` to an array.
 */

utils.arrayify = function arrayify(val) {
  return Array.isArray(val) ? val : [val];
};

/**
 * Return the property of an object.
 */

utils.result = function result(o, key) {
  var val = o[key];
  if (typeof val === 'undefined') {
    return;
  }
  if (typeof val === 'function') {
    return val.call(o);
  }
  return val;
};

/**
 * Return true if the given value is a loader.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isLoader = function isLoader(val) {
  return typeof val === 'function'
    || typeof val === 'string'
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
 * Concatenate and flatten multiple arrays, filtering
 * falsey values from the result set.
 *
 * @param {Array} `arrays` One or more arrays
 * @return {Array}
 */

utils.union = function union() {
  var arr = [].concat.apply([], [].slice.call(arguments));
  return flatten(arr).filter(Boolean);
};
