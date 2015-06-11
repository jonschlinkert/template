'use strict';

module.exports = function iteratorAsync (stack) {
  if (!stack.length || typeof stack[stack.length - 1] !== 'function') {
    throw new TypeError('iteratorAsync expects a done function.');
  }
  var done = stack.pop();

  return function (/* arguments */) {
    var args = [].slice.call(arguments);

    var len = stack.length, i = 0;
    args.unshift(null);

    if (!len) return done.apply(done, args);
    next.apply(next, args);

    function next (err/*, arguments */) {
      var args = [].slice.call(arguments);
      err = args.shift();

      if (err) return done(err);
      if (i === len) {
        return done(null, args.shift());
      }

      var fn = stack[i++];
      try {
        fn.apply(fn, args.concat(next));
      } catch(err) {
        done(err);
      }
    }
  };
};
