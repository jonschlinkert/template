'use strict';

/**
 * Initialization middleware.
 *
 * @param {Object} `env` The `Template` object.
 * @return {Function}
 * @api private
 */

module.exports = function(env) {
  return function initEnv(template, next) {
    // placeholder for adding functionality to a `template` object.
    next();
  };
};
