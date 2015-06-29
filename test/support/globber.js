'use strict';

var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var mm = require('micromatch');
var isGlob = require('is-glob');
var parent = require('glob-parent');

module.exports = globber;

function globber(pattern, options) {
  var base;

  if (isGlob(pattern)) {
    base = parent(pattern);
    pattern = pattern.slice(base.length);
  } else {
    base = path.dirname(pattern);
    pattern = path.basename(pattern);
  }

  base = path.resolve(base);

  if (pattern.charAt(0) === '/') {
    pattern = pattern.slice(1);
  }
  var files = lookup(base, pattern);
  if (files.length === 0) return [];

  return files.reduce(function(acc, fp) {
    acc[path.basename(fp)] = {
      content: fs.readFileSync(fp, 'utf8'),
      path: fp
    };
    return acc;
  }, {});
}

function lookup(dir, pattern, res) {
  res = res || [];
  var files = fs.readdirSync(dir);
  var len = files.length;
  while (len--) {
    var name = files[len];
    var fp = path.join(dir, name);

    if (fs.statSync(fp).isDirectory()) {
      lookup(fp, pattern, res);
    } else if (mm([name, fp], pattern).length) {
      res.push(fp);
    }
  }
  return res;
}