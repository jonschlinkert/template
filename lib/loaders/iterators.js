'use strict';

var es = require('event-stream');
var through = require('through2');
var utils = require('../utils');

module.exports = function (app) {
  app.iterator('promise', require('iterator-promise'));
  app.iterator('async', require('iterator-async'));

  // app.iterator('stream', require('iterator-streams'));

  app.iterator('stream', function iteratorStream(stack) {
    return function () {
      var self = this;
      var args = [].slice.call(arguments);
      var stream = through.obj();
      if (!stack.length) {
        stack = [through.obj()];
      }

      var len = stack.length, i = 0;
      while (len--) {
        var fn = stack[i++];
        if (typeof fn === 'function') {
          stack[i - 1] = fn.apply(self, args);
        }
      }

      var results = es.pipe.apply(es, stack);
      process.nextTick(function () {
        stream.write(args[0]);
        stream.end();
      });
      return stream.pipe(results);
    };
  });

  app.iterator('sync', function sync(stack) {
    stack = stack.filter(Boolean);

    if (stack.length === 0) {
      return utils.identity;
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
};
