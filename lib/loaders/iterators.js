'use strict';

module.exports = function (app) {
  app.iterator('async', require('iterator-async'));
  app.iterator('promise', require('iterator-promise'));
  app.iterator('stream', require('iterator-streams'));
  // app.iterator('sync', require('iterator-sync'));

  app.iterator('sync', function (stack) {
    stack = stack.filter(Boolean);

    if (stack.length === 0) {
      return function noop(val) {
        return val;
      };
    }

    return function () {
      var args = [].slice.call(arguments);

      var init = stack[0].apply(app, args);
      if (stack.length === 1) return init;

      return stack.slice(1).reduce(function (val, fn) {
        return fn.call(app, val);
      }.bind(app), init);
    }.bind(app);
  });
}
