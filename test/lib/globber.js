'use strict';

var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var glob = require('globby');

module.exports = function globber(patterns, options) {
  var files = glob.sync(patterns, options);
  if (files.length === 0) {
    return next(null, null);
  }

  return _.reduce(files, function(acc, fp) {
    acc[path.basename(fp)] = {
      content: fs.readFileSync(fp, 'utf8'),
      path: fp
    };
    return acc;
  }, {});
};