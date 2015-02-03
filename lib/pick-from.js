'use strict';

var pick = require('object.pick');
var slice = require('array-slice');

/**
 * Expose `pickFrom`
 */

module.exports = pickFrom;

/**
 * Pick the first property found on the array of
 * given objects.
 */

function pickFrom(key, objects, strict) {
  var len = objects.length;
  var res = null;
  var i = -1;

  while (len--) {
    var obj = objects[++i];
    var has = pick(obj, key);

    if (Object.keys(has).length) {
      if (strict && has[key] == null) {
        continue;
      }
      res = has[key];
      break;
    }
  }

  return res;
}
