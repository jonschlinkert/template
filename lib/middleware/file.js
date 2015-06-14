'use strict';

/**
 * Ensure that files have a `content` property
 */

module.exports = function(file, next) {
  file.content = file.content || (file.contents ? file.contents.toString() : '');
  next();
};
