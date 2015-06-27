'use strict';

/**
 * File system utils.
 */

var utils = module.exports;

utils.tryRead = function tryRead(fp) {
  try {
    return fs.readFileSync(fp, 'utf8');
  } catch (err) {
    return null;
  }
};
