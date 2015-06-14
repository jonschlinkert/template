'use strict';

var parser = require('parser-front-matter');
var extend = require('extend-shallow');

/**
 * Default middleware for parsing front-matter
 */

module.exports = function(app) {
  return function (file, next) {
    var config = extend({}, app.options, file.options);
    if (!config.frontMatter) return next();

    // shallow clone the options
    parser.parse(file, config, function (err) {
      if (err) return next(err);
      next();
    });
  };
};
