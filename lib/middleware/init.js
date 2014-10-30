'use strict';

/**
 * Initialization middleware
 *
 * @param {Function} `engine`
 * @return {Function}
 * @api private
 */

module.exports = function(engine) {
  return function engineInit(file, next) {
    // placeholder for adding functionality to a `file` object.
    next();
  };
};
