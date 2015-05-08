'use strict';

var merge = require('mixin-deep');

/**
 * Set the layout to use
 */

module.exports = function options(file, next) {
  if (file.locals && file.locals.hasOwnProperty('options')) {
    file.options = merge({}, file.locals.options, file.options);
    delete file.locals.options;
  }
  next();
};
