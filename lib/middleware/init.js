'use strict';

/**
 * Init middleware.
 */

module.exports = function(template) {
  return function(file, next) {
    file.data = file.data || {};
    console.log(file)
    next();
  };
};
