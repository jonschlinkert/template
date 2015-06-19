'use strict';

/**
 * Ensure that files have a `content` property
 */

module.exports = function(file, next) {
  if (file.contents && !file.content) {
    file.content = file.contents.toString();
  }
  file.content = file.content || '';
  next();
};
