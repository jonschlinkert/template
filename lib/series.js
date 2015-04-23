'use strict';

var async = require('async');

/**
 * Run middleware in series.
 */

module.exports = function series_(fns) {
  return function (file, cb) {
    async.each(fns, function (fn, next) {
      fn(file, next);
    }, cb);
  };
};
