'use strict';

/**
 * Set the layout to use
 */

module.exports = function (app) {
  return function(file, next) {
    file.options.layoutKeys = app.type.layout;
    next();
  };
};
