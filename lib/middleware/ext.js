'use strict';

var path = require('path');
var utils = require('../');

/**
 * Default middleware for parsing front-matter
 */

module.exports = function ext(file, next) {
  if (file.ext) {
    file.ext = utils.formatExt(file.ext);
    return next();
  }
  if (file.locals.ext) {
    file.ext = utils.formatExt(file.locals.ext);
    return next();
  }
  file.ext = path.extname(file.path);
  next();
};
