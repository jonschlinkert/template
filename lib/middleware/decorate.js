'use strict';

var lazy = require('lazy-cache');
var cloneDeep = lazy(require)('clone-deep');

/**
 * Decorate the template with special methods:
 *  | render
 *  | clone
 */

module.exports = function(app) {
  return function(file, next) {
    var fn = file.options.renameKey || app.option('renameKey');

    file.content = file.contents
      ? file.contents.toString()
      : file.content;

    file.render = function render(locals, cb) {
      return app.renderTemplate(file, locals, cb);
    };

    file.clone = function clone() {
      return cloneDeep()(file);
    };

    Object.defineProperty(file, 'renameKey', {
      configurable: true,
      get: function () {
        return fn;
      },
      set: function (val) {
        fn = val;
      }
    });
    next();
  };
};
