'use strict';

var extend = require('extend-shallow');

/**
 * Decorate the template with special methods:
 *  | render
 *  | clone
 */

module.exports = function(app) {
  return function(file, next) {
    file.content = file.contents
      ? file.contents.toString()
      : file.content;

    file.ctx = function ctx(locals) {
      return extend(file.locals, locals);
    };

    file.render = function render(locals, cb) {
      return app.renderTemplate(file, locals, cb);
    };
    next();
  };
};
