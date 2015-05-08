'use strict';

/**
 * Get the data and locals from each layout in a
 *  file's layout stack and add it to:
 *    - file.contexts.layoutStack
 */

module.exports = function(file, next) {
  file.contexts = file.contexts || {};
  var stack = file.contexts.layoutStack;
  var arr = stack && stack.stack || [];
  var len = arr.length, i = 0;
  var res = {};
  while (len--) {
    var layout = arr[i++].layout;
    res[layout.key] = res[layout.key] = {};
    res[layout.key].locals = layout.locals;
    res[layout.key].data = layout.data;
  }
  file.contexts.layouts = res;
  next();
};
