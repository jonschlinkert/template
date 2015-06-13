'use strict';

/**
 * Validate the file object. Checks for:
 *  - content: must be a string
 *  - path: must be a string
 */

module.exports = function (app) {
  return function(file, next) {
    app.validate(file, next);
  };
};
