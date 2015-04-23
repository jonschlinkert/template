'use strict';

var parser = require('parser-front-matter');
var merge = require('mixin-deep');

/**
 * Default middleware for parsing front-matter
 */

module.exports = function matter(app) {
  return function (file, next) {
    var opts = merge({}, app.options, file.options);
    parser.parse(file, opts, function (err) {
      if (err) return next(err);
      next();
    });
  };
};
