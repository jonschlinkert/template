'use strict';

/**
 * Get the data and locals from each layout in a
 * file's layout stack and add it to `file.options.layoutContext`
 */

module.exports = function(file, next) {
  var stack = file.options.layoutStack;
  var arr = stack && stack.stack || [];
  var len = arr.length, i = 0;
  var res = {};
  while (len--) {
    var layout = arr[i++].layout;
    res[layout.key] = res[layout.key] = {};
    res[layout.key].locals = layout.locals;
    res[layout.key].data = layout.data;
  }
  file.options.layouts = res;
  next();
};
