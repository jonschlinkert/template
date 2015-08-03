'use strict';

var path = require('path');
var typeOf = require('kind-of');
var glob = require('lazy-globby');
var lazy = require('lazy-cache')(require);
var visit = lazy('collection-visit');
var reduce = lazy('object.reduce');
var utils = require('../utils');

/**
 * Default helpers loader
 */

module.exports = function loadHelpers(helpers, options) {
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

function resolveHelpers(helpers, opts) {
  opts = opts || {};
  var cwd = opts.cwd || process.cwd();
  var files = glob().sync(helpers, opts);

  return reduce()(files, function (acc, fp) {
    fp = path.join(opts.cwd, fp);
    var name = path.basename(fp, path.extname(fp));
    acc[name] = require(path.resolve(fp));
    return acc;
  }, {});
}
