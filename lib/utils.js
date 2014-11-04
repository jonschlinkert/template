'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var typeOf = require('kind-of');
var hasValue = require('has-value');
var arrayify = require('arrayify-compact');
var deepPick = require('deep-pick');
var slice = require('array-slice');
var uniqueId = require('uniqueid');
var lookupKeys = require('./lookup-keys');
var hasOwn = require('./utils/has-own');
var debug = require('./debug');
var _ = require('lodash');


/**
 * Expose `utils`
 */

var utils = module.exports;


/**
 * Expose dependencies on `utils` for use in other
 * internal modules.
 *
 * @api private
 */

utils.arrayify = arrayify;
utils.deepPick = deepPick;

/**
 * Look for the given `lookup` string in one the specified
 * `props` of `obj`.
 *
 * ```js
 * pickFrom(template, 'ext', ['b', 'd', 'c', 'e', 'd']);
 * ```
 *
 * @param  {Object} `object` The object to search.
 * @param  {String} `lookup` The value to find.
 * @param  {Array} `props` The nested properties to search on.
 * @return {*} Returns the first value found.
 */

utils.pickFrom = function (o, lookup, props) {
  if (!o) return null;

  var isProps = Array.isArray(props);

  if (!isProps || props.length === 0) {
    if (hasOwn(o, lookup)) {
      return o[lookup];
    }
    props = Object.keys(o);
  }

  var keys = slice(props).reverse();
  var len = keys.length - 1;
  var value;

  for (var i = len; i >= 0; i--) {
    var key = keys[i];
    var val = o[key];

    if (utils.isObject(val) && hasOwn(val, lookup)) {
      value = val[lookup];
      break;
    }
  }

  if (value) return value;
  return null;
};

/**
 * Get the name of the layout to use for the given `template`.
 *
 * @param  {Object} `template` Template object to search for `layout`.
 * @param  {Object} `locals` Locals object search if not found on `template.`
 * @return {String} The name of the layout to use.
 * @api private
 */

utils.getLayout = function (template, locals) {
  debug.utils('[utils] getting layout: %j', template);

  var o = _.merge({}, template, locals);
  o = _.merge({}, o, o.options);

  return o.layout;
};

/**
 * Determine the correct engine to use for the current template.
 *
 * @param  {Object} `cache`
 * @return {Object} `template`
 * @api private
 */

utils.pickEngine = function (cache, template) {
  debug.utils('[utils] pickEngine:', arguments);
  if (!utils.isObject(cache) || !utils.isObject(template)) {
    return null;
  }

  var props = ['ext', 'engine', 'path'];
  var len = props.length;
  var ext;

  var o = _.pick(template, props);
  if (!hasValue(o)) return null;

  for (var i = 0; i < len; i++) {
    var ele = props[i];

    if (hasOwn(o, ele)) {
      if (ele === 'path') {
        ext = path.extname(o[ele]);
        break;
      } else {
        ext = o[ele];
        break;
      }
    }
  }
  if (ext) return cache[ext];
  return null;
};

/**
 * Determine the correct file extension to use, taking the following
 * into consideration, and in this order:
 *
 *   - `options.ext`
 *   - `value.data.ext`
 *   - `value.ext`
 *   - `value._opts.ext`
 *   - `path.extname(value.path)`
 *
 * The reasoning is that if an engine is explicitly defined, it should
 * take precendence over an engine that is automatically calculated
 * from `value.path`.
 *
 * @param  {String} `ext` The layout settings to use.
 * @param  {Object} `value` Template value object.
 * @param  {Object} `options` Object of options.
 * @return  {String} The extension to use.
 * @api private
 */

utils.pickExt = function(template, options, thisArg) {
  debug.utils('[utils] pickExt:', arguments);

  if (arguments.length === 2) {
    thisArg = options;
    options = {};
  }

  template = _.extend({options: {engine: ''}}, template);
  options = options || {};

  var ext = template.engine
    || template.ext
    || template.options.engine
    || options.engine
    || options.ext
    || thisArg.option('viewEngine');

  return ext ? utils.formatExt(ext) : null;
};

/**
 * Returns `null`, or `true` if the template is a layout.
 *
 * @param  {Object} `value` Template object to search for `layout`.
 * @api private
 */

utils.isPartial = function (value) {
  if (!utils.isLayout(value) && !utils.isRenderable(value)) {
    return true;
  }
  return false;
};

/**
 * Generate a unique id to be used for caching unidentified
 * tempalates. (not used currently)
 *
 * @param  {Object} `options`
 * @return {Object}
 */

utils.generateId = function(options) {
  var opts = options || {};
  return opts.id ? opts.id : uniqueId({
    prefix: opts.prefix || '__id__',
    append: opts.append || ''
  });
};

/**
 * Ensure file extensions are formatted properly for lookups.
 *
 * @param {String} `ext` File extension
 * @return {String}
 * @api private
 */

utils.formatExt = function(ext) {
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

utils.getExt = function(fp) {
  return path.extname(fp).slice(1);
};


/**
 * Bind a `thisArg` to all the functions on the target
 *
 * @param  {Object|Array} `target` Object or Array with functions as values that will be bound.
 * @param  {Object} `thisArg` Object to bind to the functions
 * @return {Object|Array} Object or Array with bound functions.
 */

utils.bindAll = function (target, thisArg) {
  if (Array.isArray(target)) {
    return target.map(function (fn) {
      return _.bind(fn, thisArg);
    });
  }
  return _.transform(target, function (acc, fn, key) {
    acc[key] = _.bind(fn, thisArg);
  });
};

/**
 * Run a loader stack with a final callback.
 *
 * @param  {Array} `stack` Array of functions to run.
 * @param  {Function} `cb` Final callback when the stack is done.
 */

utils.runLoaderStack = function (stack, cb) {
  if (typeof cb !== 'function') {
    throw new Error('Expected cb to be a function');
  }

  if (!Array.isArray(stack)) {
    return cb(new Error('Expected stack to be an Array'));
  }

  var i = 0;
  var next = function next (err) {
    if (err) return cb(err);
    var args = arguments.length === 0 ? [] : slice(arguments, 1);
    var fn = stack[i++];

    if (fn) {
      args.push(next);
      try {
        return fn.apply(fn, args);
      } catch (err) {
        args.pop();
        args.unshift(err);
        return cb.apply(cb, args);
      }
    } else {
      args.unshift(err);
      return cb.apply(cb, args);
    }
  };
  return next();
};

/**
 * Utilities for returning the native `typeof` a value.
 *
 * @api private
 */

utils.isString = function isString(val) {
  return typeOf(val) === 'string';
};

utils.isObject = function isObject(val) {
  return typeOf(val) === 'object';
};

utils.isFunction = function isFunction(val) {
  return typeOf(val) === 'function';
};

utils.isBoolean = function isBoolean(val) {
  return typeOf(val) === 'boolean';
};
