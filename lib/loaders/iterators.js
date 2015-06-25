'use strict';

exports.sync = function sync(stack) {
  return function () {
    var args = [].slice.call(arguments);
    if (stack.length === 0) {
      throw new Error('sync iterator: no loaders are registered.');
    }
    var init = stack[0].apply(this, args);
    if (stack.length === 1) return init;
    var len = stack.length - 1;
    return stack.slice(1).reduce(function (val, fn) {
      return fn.call(this, val);
    }.bind(this), init);
  };
};
