'use strict';

/**
 * Object utils.
 */

var utils = module.exports;


utils.isObject = require('is-extendable');
utils.reduce = require('object.reduce');

/**
 * Call `method` on each value in `obj`.
 *
 * @param  {Object} `thisArg` The context in which to invoke `method`
 * @param  {String} `method` Name of the method to call on `thisArg`
 * @param  {Object} `obj` Object to iterate over
 * @return {Object} `thisArg` for chaining.
 */

utils.visit = function visit(thisArg, method, obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      thisArg[method](key, obj[key]);
    }
  }
  return thisArg;
};

/**
 * Map `visit` over an array of objects.
 *
 * @param  {Object} `thisArg` The context in which to invoke `method`
 * @param  {String} `method` Name of the method to call on `thisArg`
 * @param  {Object} `arr` Array of objects.
 * @return {Object} `thisArg` for chaining.
 */

utils.mapVisit = function mapVisit(thisArg, method, arr) {
  arr.forEach(function (obj) {
    utils.visit(thisArg, method, obj);
  });
};

/**
 * Add a non-enumerable property to `receiver`
 *
 * @param  {Object} `obj`
 * @param  {String} `name`
 * @param  {Function} `val`
 */

utils.defineProp = function defineProp(receiver, key, value) {
  return Object.defineProperty(receiver, key, {
    configurable: true,
    enumerable: false,
    get: function () {
      return value;
    },
    set: function (val) {
      value = val;
    }
  });
};

/**
 * Delegate non-enumerable properties from `provider` to `receiver`.
 *
 * @param  {Object} `receiver`
 * @param  {Object} `provider`
 */

utils.delegate = function delegate(receiver, provider) {
  for (var key in provider) {
    utils.defineProp(receiver, key, provider[key]);
  }
};


utils.forward = function forward(receiver, provider, keys) {
  var len = keys.length;
  while (len--) {
    var key = keys[len];
    var val = provider[key];

    if (typeof val === 'function') {
      receiver[key] = mix(provider, val);
    } else {
      receiver[key] = provider[key];
    }
  }

  function mix(from, val) {
    return function () {
      return val.apply(from, arguments);
    };
  }
};

/**
 * Make properties on the given `obj` enumerable.
 *
 * @param  {Object} `obj`
 * @return {Object} Object with enumerable properties.
 * @api public
 */

utils.makeEnumerable = function makeEnumerable(obj) {
  var keys = Object.getOwnPropertyNames(obj);
  var len = keys.length, res = {};
  while (len--) {
    var key = keys[len];
    Object.defineProperty(res, key, {
      enumerable: true,
      value: obj[key]
    });
  }
  return res;
};

/**
 * Get the keys of all prototype methods for the given object.
 */

utils.protoKeys = function protoKeys(o) {
  if (!o || typeof o !== 'object') return [];
  var proto = Object.getPrototypeOf(o);
  return Object.keys(proto);
};

/**
 * Bind a `thisArg` to all the functions on the target
 *
 * @param  {Object|Array} `target` Object or Array with functions as values that will be bound.
 * @param  {Object} `thisArg` Object to bind to the functions
 * @return {Object|Array} Object or Array with bound functions.
 */

utils.bindAll = function bindAll(target, thisArg) {
  if (Array.isArray(target)) {
    for (var i = 0; i < target.length; i++) {
      target[i] = target[i].bind(thisArg);
    }
    return target;
  }
  return utils.reduce(target, function (acc, fn, key) {
    if (typeof fn === 'object' && typeof fn !== 'function') {
      acc[key] = utils.bindAll(fn, thisArg);
    } else {
      acc[key] = fn.bind(thisArg);
      if (fn.async) acc[key].async = fn.async;
    }
    return acc;
  }, {});
};
