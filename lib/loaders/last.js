'use strict';

var lazy = require('lazy-cache')(require);
var through = lazy('through2');
var promise = lazy('bluebird');

/**
 * Last loaders: pushed onto every loaded stack to
 * load templates onto their respective collections
 */

function extendViews(collection) {
  return function lastSync(obj) {
    for (var key in obj) {
      collection[key] = obj[key];
    }
    return obj;
  };
}

exports.sync = extendViews;

exports.async = function lastAsync(collection) {
  var fn = extendViews(collection);
  return function lastAsync_(obj, next) {
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
  return through().obj(function lastStream_(obj, enc, next) {
    var keys = ['_contents', 'stat', 'history'];
    try {
      var res = {}, file = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && keys.indexOf(key) === -1) {
          res[key] = obj[key];
        }
      }

      res.path = obj.path;
      if (obj.contents) {
        res.content = obj.contents.toString();
      }

      file[obj.path] = res;
      fn(file);

      this.push(obj);
    } catch (err) {
      this.emit('error', err);
    }
    next();
  });
};
