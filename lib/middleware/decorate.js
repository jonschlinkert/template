'use strict';

var cloneDeep = require('clone-deep');

/**
 * Decorate the template with special methods:
 *   - render()
 *   - clone()
 */

module.exports = function (app) {
  return function decorate_(file, next) {
    file.clone = function clone() {
      return cloneDeep(file);
    };
    next();
  }
};
