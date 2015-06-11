'use strict';

module.exports = function iteratorSync(stack) {
  var self = this;
  return function () {
    var len = stack.length, i = 0;
    var results;
    while (len--) {
      var fn = stack[i++].bind(self);
      var args = i === 1 ? [].slice.call(arguments) : [results];
      results = fn.apply(fn, args);
    }
    return args;
  };
};

function arrayify(val) {
  return Array.isArray(val) ? val : [val];
}
