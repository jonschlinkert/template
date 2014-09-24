'use strict';

var path = require('path');
var _ = require('lodash');
var deepPick = require('deep-pick');
var extend = require('mixin-deep');
var hasAny = require('has-any');
var hasAnyDeep = require('has-any-deep');
var isEmpty = require('is-empty');
var omit = require('omit-keys');
var omitEmpty = require('omit-empty');
var pick = require('object-pick');
var prettify = require('js-beautify').html;
var reduce = require('reduce-object');
var rootKeys = require('./root-keys');
var slice = require('array-slice');
var uniqueId = require('uniqueid');
var arrayify = require('arrayify-compact');

var hasOwn = _.has;

exports.arrayify = arrayify;


/**
 * Utility for returning the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*}
 */

var typeOf = exports.typeOf = function(val) {
  return {}.toString.call(val).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
};

var isString = exports.isString = function(val) {
  return exports.typeOf(val) === 'string';
};

var isObject = exports.isObject = function(val) {
  return exports.typeOf(val) === 'object';
};

var isNumber = exports.isNumber = function(val) {
  return exports.typeOf(val) === 'number';
};


/**
 * Omit `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.baseOmit = function(o, keys) {
  return o == null ? {} : omit(o, keys);
};


/**
 * Pick `keys` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.basePick = function(o, keys) {
  return o == null ? {} : pick(o, keys);
};


/**
 * Pick `rootKeys` from `object`.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.pickRoot = function(o) {
  return exports.basePick(o, rootKeys);
};


/**
 * Pick `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.pickLocals = function(o) {
  var root = exports.baseOmit(o, rootKeys);
  return extend({}, root, pick(o, 'locals'));
};


/**
 * Pick `options` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.pickOptions = function(o) {
  return exports.basePick(o, 'options');
};


/**
 * Determine the correct layout to use for the given `value`.
 *
 * @param  {Object} `value` File object to test search for `layout`.
 * @return {String} The name of the layout to use.
 * @api private
 */

exports.pickLayout = function (value) {
  return exports.pickFrom(value, 'layout', ['data', 'locals', 'options']);
};


/**
 * Determine the correct layout to use for the given `value`.
 *
 * @param  {Object} `value` File object to test search for `layout`.
 * @return {String} The name of the layout to use.
 * @api private
 */

exports.pickContent = function (file) {
  if (isString(file)) {
    return file;
  }
  return exports.basePick(file, 'content');
};


/**
 * Determine the correct layout to use for the given `value`.
 *
 * @param  {Object} `value` File object to test search for `layout`.
 * @return {String} The name of the layout to use.
 * @api private
 */

exports.pickCached = function (name, o, arr) {
  if (!isString(name)) {
    return null;
  }
  return exports.pickFrom(o, name, arr);
};


/**
 * Determine the correct layout to use for the given `value`.
 *
 * @param  {Object} `value` File object to test search for `layout`.
 * @return {String} The name of the layout to use.
 * @api private
 */

exports.pickEngine = function (cache, value) {
  if (!isObject(cache) || !isObject(value)) {
    return null;
  }

  var props = ['ext', 'engine', 'path'];
  var len = props.length;
  var ext;

  var maybe = pick(value, props);
  if (isEmpty(maybe)) {
    return null;
  }

  for (var i = 0; i < props.length; i++) {
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
  };

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

exports.pickExt = function(value, options) {
  var file = extend({}, options, value);
  var found, ext;

  if (hasOwn(file, 'ext')) {
    ext = file.ext;
  }

  if (!ext) {
    ext = _.detect(file, 'ext');
  }

  if (!ext && hasOwn(file, 'path')) {
    ext = path.extname(file.path);
  }

  if (!ext) {
    ext = _.detect(file, 'path');
    if (ext) {
      ext = path.extname(ext.path);
    }
  }

  return exports.formatExt(ext);
};


/**
 * Throw an error if `file` does not have `props`.
 *
 * @param  {String} `file` The object to test.
 * @api private
 */

exports.assertRootKeys = function(file, props) {
  return hasAny(file, ['content', 'path', 'locals']);
};


/**
 * Omit `locals` from `object`
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.omitLocals = function(o) {
  return exports.baseOmit(o, 'locals');
};


/**
 * Omit the `options` property from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.omitOptions = function(o) {
  return exports.baseOmit(o, ['options']);
};


/**
 * Omit root properties from the given
 * object.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.omitRoot = function(o) {
  return exports.baseOmit(o, rootKeys);
};


/**
 * Flatten nested `locals` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.flattenLocals = function(obj) {
  var locals = exports.pickLocals(obj);
  var o = extend({}, locals, locals.locals);
  return exports.omitLocals(exports.omitRoot(o), 'locals');
};


/**
 * Flatten nested `options` objects.
 *
 * @param  {Object} `object`
 * @return {Object}
 */

exports.flattenOptions = function(obj) {
  var options = exports.pickOptions(obj);
  var opts = extend({}, obj, options.options);
  return exports.omitOptions(exports.omitRoot(opts), 'options');
};



exports.pickFrom = function(value, key, arr) {
  var val = null;

  if (!_.isObject(value)) {
    return null;
  }

  if (_.has(value, key)) {
    return value[key];
  }

  var len = (arr && arr.length);
  if (len === 0) {
    return val;
  }

  for (var i = 0; i < len; ++i) {
    var prop = arr[i];

    if (_.has(value, prop)) {
      val = value[prop];
      if (_.has(val, key)) {
        return val[key];
      }
    }
  }
  return val;
};


/**
 * Ensure file extensions are formatted properly for lookups.
 *
 * @api private
 */

exports.setHeuristics = function(o) {
  if (o == null) {
    return {};
  }

  var opts = o.options || {};
  var a = {};
  var b = {};

  a.ext || opts.ext || path.extname(opts.path) || null;
  a.engine = opts.engine || a.ext;
  a.renderable = opts.renderable;
  a.normalized = true;

  b.__config = omitEmpty(a);
  return b;
};


/**
 * Ensure file extensions are formatted properly for lookups.
 *
 * @api private
 */

exports.formatExt = function(ext) {
  if (ext && ext[0] !== '.') {
    ext = '.' + ext;
  }
  return ext;
};


/**
 * Format HTML using [js-beautify].
 *
 * @param  {String} `html` The HTML to beautify.
 * @param  {Object} `options` Options to pass to [js-beautify].
 * @return {String} Formatted string of HTML.
 */

exports.prettify = function(html, options) {
  return prettify(html, _.extend({
    indent_handlebars: true,
    indent_inner_html: true,
    preserve_newlines: false,
    max_preserve_newlines: 1,
    brace_style: 'expand',
    indent_char: ' ',
    indent_size: 2,
  }, options));
};


/**
 * Get the type of a value.
 *
 * @param  {*} `value`
 * @return {*}
 * @api private
 */

exports.typeOf = function (value) {
  return {}.toString.call(value).toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
};
