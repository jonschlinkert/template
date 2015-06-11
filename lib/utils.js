'use strict';

var lazy = require('lazy-cache')(require);
var flatten = lazy('arr-flatten');
var notEmpty = lazy('has-values');
var isObject = lazy('isobject');
var pick = lazy('pick-first');

exports.arrayify = function arrayify(val) {
  if (typeof val === 'string') {
    return [val];
  }
  if (Array.isArray(val)) {
    return val;
  }
  throw new TypeError('utils.arrayify expects val to be a string or array.');
};

exports.get = function get(options, prop) {
  return pick()(options || {}, prop);
};

exports.isStream = function isStream (val) {
  if (typeof val === 'undefined') {
    throw new TypeError('utils.isStream expects val to not be undefined.');
  }
  return val && typeof val === 'object' && typeof val.pipe === 'function';
};

exports.isPromise = function isPromise (val) {
  if (typeof val === 'undefined') {
    throw new TypeError('utils.isPromise expects val to not be undefined.');
  }
  if (typeof val !== 'object' && typeof val !== 'function') {
    return false;
  }
  return typeof val.then === 'function';
};

exports.siftArgs = function siftArgs(opts, stack) {
  stack = [].slice.call(arguments);
  opts = isObject()(opts) ? stack.shift(): {};
  return {opts: opts, stack: flatten()(stack)};
};

exports.filterLoaders = function filterLoaders(cache) {
  return function() {
    var args = [].slice.call(arguments);
    var res = {rest: [], stack: []};
    var len = args.length;
    while (len--) {
      var arg = args[len];
      if (len > 0 && exports.isLoader(arg, cache)) {
        res.stack.unshift(arg);
      } else {
        res.rest.unshift(arg);
      }
    }
    res.stack = flatten()(res.stack.filter(notEmpty()));
    res.rest = res.rest.filter(notEmpty());
    if (res.rest.length > 1 && isObject()(res.rest[res.rest.length - 1])) {
      res.opts = res.rest.pop();
    }
    return res;
  };
};

exports.isLoader = function isLoader(val, cache) {
  return (cache && typeof val === 'string' && cache[val])
    || typeof val === 'function'
    || exports.isStream(val)
    || Array.isArray(val);
};
