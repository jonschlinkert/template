'use strict';

var through = require('through2');
var es = require('event-stream');

module.exports = function iteratorStream(stack) {
  return function () {
    var stream = through.obj();
    stream.on('error', console.error);

    var args = [].slice.call(arguments);
    var len = stack.length, i = 0;
    if (len === 0) return stream;
    var pipeline = [];

    while (len--) {
      var loader = stack[i++];
      if (typeof loader === 'function') {
        pipeline.push(loader.apply(loader, args));
      } else {
        pipeline.push(loader);
      }
    }

    var result = stream.pipe(es.pipe.apply(es, pipeline));
    result.on('error', console.error);

    process.nextTick(function () {
      stream.write(args[0]);
      stream.end();
    });
    return result;
  };
};
