'use strict';

/**
 * Set the layout to use
 */

module.exports = function (app) {
  return function(file, next) {
    var keys = app.type.layout;

    next();
  };
}
