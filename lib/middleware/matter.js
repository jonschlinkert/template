'use strict';

var parser = require('parser-front-matter');
var extend = require('extend-shallow');

/**
 * Default middleware for parsing front-matter
 */

module.exports = function(app) {
  var options = app.option('matter');

  return function (file, next) {
    var opts = file.options;

    // we only want file options here, not application options
    if (opts.matter === false || opts.noread === true || opts.read === false) {
      return next();
    }

    // shallow clone the options
    var config = extend({}, options, opts);

    parser.parse(file, config, function (err) {
      if (err) return next(err);
      next();
    });
  };
};
