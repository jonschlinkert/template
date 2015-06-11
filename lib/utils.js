'use strict';

var flatten = require('arr-flatten');
var isObject = require('isobject');
var pick = require('pick-first');

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
  return pick(options || {}, prop);
};

exports.isStream = function isStream (val) {
  if (typeof val === 'undefined') {
    throw new TypeError('utils.isStream expects val to not be undefined.');
  }
  return val && typeof val === 'object' && typeof val.pipe === 'function';
};


exports.siftArgs = function siftArgs(opts, stack) {
  stack = [].slice.call(arguments);
  opts = isObject(opts) ? stack.shift(): {};
  return {opts: opts, stack: flatten(stack)};
};

exports.filterArgs = function filterArgs(cache) {
  return function() {
    var args = [].slice.call(arguments);
    var res = {args: [], stack: []};
    var len = args.length;

    while (len--) {
      var arg = args[len];
      if (len > 1 && exports.isLoader(arg, cache)) {
        res.stack.unshift(arg);
      } else {
        res.args.unshift(arg);
      }
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
