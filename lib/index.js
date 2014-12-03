'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var slice = require('array-slice');
var debug = require('./debug');
var _ = require('lodash');

/**
 * Default router methods used in all Template instances
 * @api private
 */

exports.methods = ['onLoad', 'before', 'after'];

/**
 * Get the name of the layout to use for the given `template`.
 *
 * @param  {Object} `template` Template object to search for `layout`.
 * @param  {Object} `locals` Locals object search if not found on `template.`
 * @return {String} The name of the layout to use.
 * @api private
 */

exports.getLayout = function (template, locals) {
  debug.utils('[utils] getting layout: %j', template);

  var o = _.merge({}, template, locals);
  o = _.merge({}, o, o.options);

  return o.layout;
};

/**
 * Bind a `thisArg` to all the functions on the target
 *
 * @param  {Object|Array} `target` Object or Array with functions as values that will be bound.
 * @param  {Object} `thisArg` Object to bind to the functions
 * @return {Object|Array} Object or Array with bound functions.
 */

exports.bindAll = function (target, thisArg) {
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
 * Ensure file extensions are formatted properly for lookups.
 *
 * @param {String} `ext` File extension
 * @return {String}
 * @api private
 */

exports.formatExt = function(ext) {
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

exports.getExt = function(fp) {
  return path.extname(fp).slice(1);
};

/**
 * Extend the `to` object with the method on the `from` object.
 *
 * @param  {Object} `to` Object to add the method to.
 * @param  {Object} `from` Object to get the method from.
 * @param  {Object} `toProp` method name to add to the `to` object
 * @param  {Object} `fromProp` method name on the from object.
 * @api private
 */

exports.mixinLoaders = function(template, loaders) {
  return function(toProp, fromProp) {
    fromProp = fromProp || toProp;

    template[toProp] = function() {
      return loaders[fromProp].apply(loaders, arguments);
    };
  }
};