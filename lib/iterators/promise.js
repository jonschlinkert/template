'use strict';

module.exports = function iteratorPromise (stack) {
  return function (obj) {
    var Promise = require('bluebird');
    var current = Promise.resolve();

    if (!stack.length) {
      return current.then(function () {
        return obj;
      });
    }

    return Promise.reduce(stack, function (acc, fn) {
      return fn(acc);
    }, obj);
  };
};
