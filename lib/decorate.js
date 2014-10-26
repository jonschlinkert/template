'use strict';

/**
 * Module dependencies
 */

var camelize = require('./utils/camelize');

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

exports.methodName = function (method, type) {
  return camelize(method) + type[0].toUpperCase() + type.slice(1);
};
