'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var deepPick = require('deep-pick');
var merge = require('mixin-deep');
var hasAny = require('has-any');
var isEmpty = require('is-empty');
var omit = require('omit-keys');
var omitEmpty = require('omit-empty');
var pick = require('object-pick');
var slice = require('array-slice');
var uniqueId = require('uniqueid');
var arrayify = require('arrayify-compact');
var _ = require('lodash');
var lookupKeys = require('./lookup-keys');
var debug = require('./debug');


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
utils.pick = pick;
utils.omit = omit;


/**
 * Utilities for returning the native `typeof` a value.
 *
 * @api private
 */

utils.typeOf = function typeOf(val) {
  return {}.toString.call(val).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
};

utils.isString = function isString(val) {
  return utils.typeOf(val) === 'string';
};

utils.isObject = function isObject(val) {
  return utils.typeOf(val) === 'object';
};

utils.isFunction = function isFunction(val) {
  return utils.typeOf(val) === 'function';
};

utils.isNumber = function isNumber(val) {
  return utils.typeOf(val) === 'number';
};

utils.isBoolean = function isBoolean(val) {
  return utils.typeOf(val) === 'boolean';
};

var hasOwn = utils.hasOwn = function(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
};


/**
 * Pick `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.basePick = function(o, keys) {
  return o == null ? {} : pick(o, keys);
};


/**
 * Pick `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.pickDelims = function(template, locals) {
  return (template.options && template.options.delims) || locals.delims;
};


/**
 * Determine the correct layout to use for the given `value`.
 *
 * @param  {Object} `value` Template object to test search for `layout`.
 * @return {String} The name of the layout to use.
 * @api private
 */

utils.pickContent = function (template) {
  if (utils.isString(template)) {
    return template;
  }
  return utils.basePick(template, 'content');
};


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
  if (o == null) {
    return null;
  }

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

  if (value) {
    return value;
  }
  return null;
};


/**
 * Get the correct layout to use for the given `template`.
 *
 * @param  {Object} `template` Template object to search for `layout`.
 * @param  {Object} `locals` Locals object search if not found on `template.`
 * @return {String} The name of the layout to use.
 * @api private
 */

utils.pickLayout = function (template, locals) {
  debug.utils('[utils] pickLayout:', arguments);
  var last = _.last(arguments);

  template.layout = utils.pickFrom(template, 'layout', lookupKeys);

  if (!template.layout && locals != null) {
    template.layout = utils.pickFrom(locals, 'layout', lookupKeys);
  }

  // Return the layout name if the last arg is `true`
  if (utils.isBoolean(last)) {
    return template.layout;
  }
};


/**
 * Returns `null`, or `true` if the template is a layout.
 *
 * @param  {Object} `value` Template object to search for `layout`.
 * @api private
 */

utils.isLayout = function (value) {
  return utils.pickFrom(value, 'isLayout', lookupKeys);
};


/**
 * Determine the correct layout to use for the given `value`.
 *
 * @param  {Object} `value` Template object to test search for `layout`.
 * @return {String} The name of the layout to use.
 * @api private
 */

utils.templateType = function (plural, thisArg) {
  debug.utils('[utils] templateType:', arguments);

  if (!utils.isString(arguments[0])) {
    thisArg = plural;
    plural = 'isRenderable';
  }

  return thisArg.templateType[plural];
};


/**
 * Determine the correct layout to use for the given `value`.
 *
 * @param  {Object} `value` Template object to test search for `layout`.
 * @return {String} The name of the layout to use.
 * @api private
 */

utils.pickCached = function (file, locals, thisArg) {
  debug.utils('[utils] pickCached:', arguments);

  var val = null;

  if (!utils.isString(arguments[0])) {
    return val;
  }

  var types = thisArg.templateType.isRenderable;
  var name = file;

  for (var i = 0; i < types.length; i++) {
    var cache = thisArg.cache[types[i]];
    if (hasOwn(cache, name)) {
      val = cache[name];
      break;
    }
  }
  return val;
};


/**
 * Determine the correct engine to use for the current template.
 *
 * @param  {Object} `cache`
 * @return {Object} `template`
 * @api private
 */

utils.pickEngine = function (cache, template) {
  debug.utils('[utils] pickCached:', arguments);

  if (!utils.isObject(cache) || !utils.isObject(template)) {
    return null;
  }

  var props = ['ext', 'engine', 'path'];
  var len = props.length;
  var ext;

  var maybe = pick(template, props);
  if (isEmpty(maybe)) {
    return null;
  }

  for (var i = 0; i < len; i++) {
    var ele = props[i];

    if (hasOwn(maybe, ele)) {
      if (ele === 'path') {
        ext = path.extname(maybe[ele]);
        break;
      } else {
        ext = maybe[ele];
        break;
      }
    }
  }

  if (ext) {
    return cache[ext];
  }

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

  template = merge({options: {engine: ''}}, template);
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
 * @api private
 */

utils.formatExt = function(ext) {
  if (ext && ext[0] !== '.') {
    ext = '.' + ext;
  }
  return ext;
};
