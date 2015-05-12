'use strict';

var cloneDeep = require('clone-deep');

/**
 * Decorate the template with special methods:
 *  | render
 *  | clone
 */

module.exports = function(app) {
  return function(file, next) {
    file.render = function render(locals, cb) {
      return app.renderTemplate(file, locals, cb);
    };
    file.clone = function clone() {
      return cloneDeep(file);
    };
    next();
  };
};
