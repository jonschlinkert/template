'use strict';

var path = require('path');
var utils = require('../');

/**
 * Default middleware for parsing front-matter
 */

module.exports = function ext_(file, next) {
  if (file.ext) {
    file.ext = utils.formatExt(file.ext);
    return next();
  }

  if (file.locals && file.locals.ext) {
    file.ext = utils.formatExt(file.locals.ext);
    return next();
  }

  if (file.options && file.options.ext) {
    file.ext = utils.formatExt(file.options.ext);
    return next();
  }

  var ext = path.extname(file.path);
  if (ext) file.ext = ext;
  next();
};
