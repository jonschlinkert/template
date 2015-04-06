'use strict';

/**
 * Set the layout to use
 */

module.exports = function layout(file, next) {
  file.layout = file.layout || file.locals.layout || file.options.layout;
  next();
};
