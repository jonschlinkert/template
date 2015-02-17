'use strict';

var path = require('path');
var glob = require('globby');
var typeOf = require('kind-of');
var reduce = require('object.reduce');
var extend = require('extend-shallow');

/**
 * Default loader for Template
 */

module.exports = function (template) {
  return function (helpers, options) {
    var o = {};
    if (typeOf(helpers) === 'object') {
      return helpers;
    } else if (Array.isArray(helpers) || typeof helpers === 'string') {
      // if it's an object, it's not a glob
      if (typeOf(helpers[0]) === 'object') {
        reduce(helpers, function (acc, o) {
          return extend(acc, o);
        }, o);
      } else {
        var files = glob.sync(helpers, options);
        reduce(files, function (acc, fp) {
          var name = path.basename(fp, path.extname(fp));
          acc[name] = require(path.resolve(fp));
          return acc;
        }, o);
      }
      return o;
    }
  };
};
