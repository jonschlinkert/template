'use strict';

var lazy = require('lazy-cache')(require);
var through = lazy('through2');
var promise = lazy('bluebird');

/**
 * Last loaders: pushed onto every loaded stack to
 * load templates onto their respective collections
 */

function extendViews(collection) {
  return function (obj) {
    for (var key in obj) {
      collection[key] = obj[key];
    }
    return obj;
  };
}

exports.sync = extendViews;

exports.async = function lastAsync(collection) {
  var fn = extendViews(collection);
  return function (obj, next) {
    try {
      next(null, fn(obj));
    } catch (err) {
      next(err);
    }
  };
};

exports.promise = function lastPromise(collection) {
  var Promise = promise();
  return Promise.method(extendViews(collection));
};

exports.stream = function lastStream(collection) {
  var fn = extendViews(collection);
  return through().obj(function (obj, enc, next) {
    try {
      this.push(fn(obj));
    } catch (err) {
      this.emit('error', err);
    }
    next();
  });
};
