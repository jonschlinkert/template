'use strict';

var path = require('path');
var glob = require('lazy-globby');
var typeOf = require('kind-of');
var reduce = require('object.reduce');

/**
 * Default loader for Template
 */

module.exports = function () {
  return function (helpers, options) {
    var o = {};
    if (typeOf(helpers) === 'object') {
      return helpers;
    }

    helpers = Array.isArray(helpers) ? helpers : [helpers];

    // if it's an object, it's not a glob
    if (typeOf(helpers[0]) === 'object') {
      return mergeHelpers(helpers, o);
    }
    var files = glob().sync(helpers, options);
    return resolveHelpers(files, o);
  };
};

function mergeHelpers(helpers, obj) {
  for (var key in helpers) {
    var val = helpers[key];
    if (typeof val === 'object') {
      mergeHelpers(val, obj);
    } else {
      obj[key] = helpers[key];
    }
  }
  return obj;
}

function resolveHelpers(files, obj) {
  return reduce(files, function (acc, fp) {
    var name = path.basename(fp, path.extname(fp));
    acc[name] = require(path.resolve(fp));
    return acc;
  }, obj);
}
