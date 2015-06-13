'use strict';

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

    Object.defineProperty(file, 'renameKey', {
      configurable: true,
      get: function () {
        return fn;
      },
      set: function (val) {
        fn = val;
      }
    });

    file.next = next();
    next();
  };
};
