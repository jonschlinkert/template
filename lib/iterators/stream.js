'use strict';

module.exports = function iteratorStream(stack) {
  return function () {
    var lazypipe = require('lazypipe');
    var through = require('through2');
    var factory = lazypipe();
    if (!stack.length) {
      var noop = through.obj(function (obj, enc, next) {
        this.push(obj);
        next();
      });
      stack = [noop];
    }

    var len = stack.length, i = 0;
    var written = false;
    while (len--) {
      var loader = stack[i++];
      if (typeof loader === 'function') {
        if (i === 1) {
          written = true;
          var args = [].slice.call(arguments);
          factory = factory.pipe.apply(factory, [loader].concat(args));
        } else {
          factory = factory.pipe(loader);
        }
      } else {
        factory = factory.pipe(function () { return loader; });
      }
    }
    var stream = factory();
    stream.on('error', console.error);
    process.nextTick(function () {
      if (!written) {
        stream.write(obj);
        stream.end();
      }
    });
    return stream;
  };
};
