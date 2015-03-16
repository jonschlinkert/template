'use strict';

/**
 * Initialization middleware. Prime `file.data`.
 */

module.exports = function(template) {
  return function init(file, next) {
    file.data = file.data || {};
    next();
  };
};
