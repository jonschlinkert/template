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
    // placeholder
    next();
  };
};
