'use strict';

var path = require('path');
var utils = require('template-utils')._;

/**
 * Get the extension to match to an engine.
 */

module.exports = function(app) {
  return function(file, next) {
    var ext = file.ext
      || file.locals && file.locals.ext
      || file.options && file.options.ext
      || path.extname(file.path);

    if (typeof ext === 'undefined') {
      ext = app.option('view engine');
    }

    file.ext = utils.formatExt(ext);
    next();
  };
};
