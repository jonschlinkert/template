var utils = require('./utils');


module.exports = function resolve(cache) {
  var loader = {};
  cache = cache || {};

  loader.set = function set(key, loaders) {
    cache[key] = stack(key, [].slice.call(arguments, 1));
  };

  loader.get = function get(val) {
    return cache[val] || val;
  };

  loader.stack = function stack(key, val) {
    return utils.union(cache[key] || [], val);
  };

  loader.compose = function compose() {
    var stack = resolve([].slice.call(arguments));
    return function (arg) {
      var len = stack.length, i = -1;
      while (len--) {
        var fn = stack[len];
        if (++i === 0) {
          arg = fn.apply(this, arguments);
        } else {
          arg = fn.call(this, arg);
        }
      }
      return arg;
    };
  };

  loader.resolve = function resolve(stack) {
    return build(stack);

    function build(stack, res) {
      stack = get(stack);
      var len = stack.length, i = 0;
      res = res || [];

      while (len--) {
        var val = get(stack[i++]);
        if (Array.isArray(val)) {
          build(val, res);
        } else {
          res.push(val);
        }
      }
      return res;
    }
  };

  // function loader(key, options, val) {
  //   var args = [].slice.call(arguments, 1);
  //   var opts = !utils.isLoader(options) ? args.shift() : {};
  //   set(key, args);
  // }

  return loader;
}

function addOne(num) {
  return function (i) {
    i = i + num;
    return i;
  }
}

set('foo', [addOne(1)], function foo() {});
set('bar', [addOne(1)]);
set('a', [addOne(1)], ['foo', 'bar']);
set('a', [addOne(1)]);
set('a', [addOne(1)]);
set('a', [addOne(1)]);

set('b', [addOne(1), ['a']]);
set('c', [addOne(1), ['b']]);
set('d', [addOne(1), ['c']]);
set('e', [addOne(1), ['d']]);


// console.log(cache)
console.log(resolve('e'))

// console.log(compose('e')(1))
