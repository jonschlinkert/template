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


/**
 * Return true if the `array` has the given native `type`.
 *
 * @param  {Array}  `arr`
 * @param  {String}  `type` Native type to look for.
 * @return {Boolean}
 */

utils.hasType = function hasType(arr, type) {
  var val = false;

  for (var i = 0; i < arr.length; i++) {
    var value = arr[i];
    if (typeOf(value) === type) {
      val = true;
      break;
    }
  };

  return val;
};

/**
 * Pick `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

utils.basePick = function(o, keys) {
  return o == null ? {} : _.pick(o, keys);
};

/**
 * Pull out a middleware stack from arguments.
 *
 * @param  {Function|Array} `fns` middleware stack
 * @param  {Array} `args` Additional arguments that might have middleware functions
 * @return {Array} middleware stack
 */

utils.filterMiddleware = function(fns, args) {
  var arr = Array.isArray(fns) ? fns : [];

  return arr.concat(args.filter(function(arg) {
    return typeof arg === 'function';
  }));
};

/**
 * Pick `delims` array from `template`
 *
 * @param  {Object} `template`
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
  if (utils.isString(template)) return template;
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
 * Get the correct layout to use for the given `template`.
 *
 * @param  {Object} `template` Template object to search for `layout`.
 * @param  {Object} `locals` Locals object search if not found on `template.`
 * @return {String} The name of the layout to use.
 * @api private
 */

utils.determineLayout = function (template, locals) {
  debug.utils('[utils] determineLayout:', arguments);
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
 * Get a template from the cache by iterating through
 * the given `types`. By default, if `types` are not
 * defined, only `renderable` sub-types will be searched.
 *
 * @param  {String} `str`
 * @param  {Object} `thisArg`
 * @param  {Array} `types`
 * @return {Object}
 */

utils.firstOfType = function (name, thisArg, types) {
  debug.utils('[utils] firstOfType:', arguments);
  var val = null;

  if (!utils.isString(arguments[0])) return val;
  types = utils.arrayify(types || 'renderable');

  for (var i = 0; i < types.length; i++) {
    var type = types[i];
    var cached = thisArg.type[type];

    for (var j = 0; j < cached.length; j++) {
      var cache = thisArg.cache[cached[j]];
      if (Boolean(cache[name])) {
        val = cache[name];
        break;
      }
    }
  }
  return val;
};

/**
 * Get a renderable template from the cache.
 *
 * @param  {String} `name`
 * @param  {Object} `thisArg`
 * @return {Object}
 */

utils.getRenderable = function (name, thisArg) {
  debug.utils('[utils] getRenderable:', arguments);
  return utils.firstOfType(name, thisArg, ['renderable']);
};

/**
 * Get a renderable template from the cache.
 *
 * @param  {String} `name`
 * @param  {Object} `thisArg`
 * @return {Object}
 */

utils.getLayout = function (name, thisArg) {
  debug.utils('[utils] getLayout:', arguments);
  return utils.firstOfType(name, thisArg, ['layout']);
};

/**
 * Get a partial template from the cache.
 *
 * @param  {String} `name`
 * @param  {Object} `thisArg`
 * @return {Object}
 */

utils.getPartial = function (name, thisArg) {
  debug.utils('[utils] getPartial:', arguments);
  return utils.firstOfType(name, thisArg, ['partial']);
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

utils.isLayout = function (value) {
  return !!utils.pickFrom(value, 'isLayout', lookupKeys);
};

/**
 * Returns `null`, or `true` if the template is a layout.
 *
 * @param  {Object} `value` Template object to search for `layout`.
 * @api private
 */

utils.isRenderable = function (value) {
  return !!utils.pickFrom(value, 'isRenderable', lookupKeys);
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
 * Utilities for returning the native `typeof` a value.
 *
 * @api private
 */

utils.typeOf = typeOf;

utils.isString = function isString(val) {
  return typeOf(val) === 'string';
};

utils.isObject = function isObject(val) {
  return typeOf(val) === 'object';
};

utils.isFunction = function isFunction(val) {
  return typeOf(val) === 'function';
};

utils.isNumber = function isNumber(val) {
  return typeOf(val) === 'number';
};

utils.isBoolean = function isBoolean(val) {
  return typeOf(val) === 'boolean';
};

var hasOwn = utils.hasOwn = function(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
};