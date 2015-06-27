'use strict';

var path = require('path');
var get = require('get-value');
var set = require('set-value');
var extend = require('extend-shallow');

var array = require('./array');
var object = require('./object');

/**
 * Expose `utils`
 */

var utils = module.exports = require('export-files')(__dirname);

utils.forward = object.forward;
utils.defineProp = object.defineProp;
utils.delegate = object.delegate;
utils.protoKeys = object.protoKeys;
utils.arrayify = array.arrayify;
utils.visit = object.visit;

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

utils.getLocals = function getLocals(locals, options) {
  var ctx = extend.apply(extend, arguments);
  extend(ctx, ctx.hash);
  return ctx;
};

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
  opts = opts || {};
  return array.flatten([opts, args]);
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
 * Cast `val` to an array.
 */

utils.error = function error(msg, val) {
  throw new Error(msg + JSON.stringify(val));
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
  return val && object.isObject(val) && typeof val.pipe === 'function';
};

/**
 * Return true if the given object is a promise.
 *
 * @param  {Object} `val`
 * @return {Boolean}
 */

utils.isPromise = function isPromise (val) {
  return val && object.isObject(val) && typeof val.then === 'function';
};



utils.assign = function assign(thisArg) {
  return function() {
    var args = [].slice.call(arguments);
    return extend.apply(extend, [thisArg].concat(args));
  };
};

/**
 * Returns a function to be used as a base for `get/set`
 * methods, like `options` and `data`.
 *
 * @param  {Object} `thisArg`
 * @param  {String} `method` Method name
 * @param  {Object} `targetObject`
 * @return {Object} `thisArg` for chaining
 */

utils.base = function(thisArg, method, targetObject) {
  return function (prop, value) {
    var len = arguments.length;
    var type = typeof prop;

    if (type === 'string' && len === 1) {
      return get(targetObject, prop);
    }

    if (type === 'object') {
      thisArg.visit(method, prop);
      return thisArg;
    }

    set(targetObject, prop, value);
    thisArg.emit(method, prop, value);
    return thisArg;
  };
};

utils.option = function option(thisArg, prop, value) {
  return utils.base(thisArg, 'option', thisArg.options)(prop, value);
};

utils.data = function data(thisArg, prop, value) {
  return utils.base(thisArg, 'data', thisArg.cache.data)(prop, value);
};

