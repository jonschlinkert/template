'use strict';

/* deps: parser-front-matter extend-shallow */
var lazy = require('lazy-cache');
var parser = lazy(require)('parser-front-matter');
var extend = lazy(require)('extend-shallow');

/**
 * Default middleware for parsing front-matter
 */

module.exports = function(app) {
  return function (file, next) {
    var config = extend()({}, app.options, file.options);
    if (!config.frontMatter) return next();

    // shallow clone the options
    parser().parse(file, config, function (err) {
      if (err) return next(err);
      next();
    });
  };
};
