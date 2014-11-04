'use strict';

/**
 * Utility for getting an own property from an object.
 *
 * @param  {Object} `o`
 * @param  {Object} `prop`
 * @return {Boolean}
 * @api true
 */

module.exports = function hasOwn(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
};
