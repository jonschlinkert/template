'use strict';

var merge = require('mixin-deep');

/**
 * Set the layout to use
 */

module.exports = function(file, next) {
  merge(file.options, file.locals && file.locals.options);
  delete file.locals.options;
  next();
};
