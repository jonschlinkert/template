'use strict';

module.exports = function iteratorAync (stack) {
  return function (/* arguments */) {
    var args = [].slice.call(arguments);
    var done = args.pop();
    var len = stack.length, i = 0;
    args.unshift(null);
    if (!len) return done.apply(done, args);
    next.apply(next, args);

    function next (err/*, arguments */) {
      args = [].slice.call(arguments);
      err = args.shift();
      if (err) return done(err);
      if (i >= len) return done(null, args.shift());

      var fn = stack[i++];
      fn.apply(fn, args.concat(next));
    }
  };
};
