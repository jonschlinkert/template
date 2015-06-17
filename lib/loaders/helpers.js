'use strict';

var path = require('path');
var glob = require('lazy-globby');
var typeOf = require('kind-of');
var reduce = require('object.reduce');
var utils = require('../utils');

/**
 * Default loader for Template
 */

module.exports = function (app) {
  return function helpersFn(helpers, options) {
    var o = {};
    if (typeOf(helpers) === 'object') {
      return helpers;
    }

    helpers = utils.arrayify(helpers);

    // if it's an object, it's not a glob
    if (typeOf(helpers[0]) === 'object') {
      return mergeHelpers(helpers, o);
    }
    return resolveHelpers(helpers, options);
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

function resolveHelpers(helpers, options) {
  var files = glob().sync(helpers, options);
  return reduce(files, function (acc, fp) {
    var name = path.basename(fp, path.extname(fp));
    acc[name] = require(path.resolve(fp));
    return acc;
  }, {});
}
