'use strict';

var isObject = require('isobject');
var flatten = require('arr-flatten');

/**
 * Expose `utils`
 */

var utils = module.exports;
utils.flatten = flatten;

/**
 * Default router methods used in all Template instances
 */

utils.methods = [
  'onLoad',
  'preCompile',
  'postCompile',
  'preRender',
  'postRender'
];

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
