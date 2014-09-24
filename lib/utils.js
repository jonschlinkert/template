'use strict';

var _ = require('lodash');

exports.pickFrom = function pickFrom(value, key, arr) {
  var val = null;

  if (!_.isObject(value)) {
    return val;
  }

  if (_.has(value, key)) {
    return value[key];
  }

  var len = (arr && arr.length);
  if (len === 0) {
    return val;
  }

  for (var i = 0; i < len; ++i) {
    var prop = arr[i];
    if (_.has(value, prop)) {
      val = value[prop];
      if (_.has(val, key)) {
        return val[key];
      }
    }
  }
  return val;
};
