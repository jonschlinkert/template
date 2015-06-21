'use strict';

/**
 * Set the layout to use
 */

module.exports = function(file, next) {
  if (typeof file.layout === 'undefined') {
    file.layout = file.data.layout || file.locals.layout || file.options.layout;
  }
  next();
};
