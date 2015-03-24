'use strict';

/**
 * Default method for looking up collection properties on a file.
 *
 * ```js
 * var props = ['tags', 'categories'];
 * var defaultProps = require('./default-props')(props);
 * var collectionItems = defaultProps(file);
 * //=> { tags: [ 'foo', 'bar'], categories: [ 'beep', 'boop' ] }
 * ```
 *
 * @param  {Array} `props` Array of properties
 * @return {Function} Function that takes a `file` to search for properties on.
 */

module.exports = function defaultProps(props) {
  return function (file) {
    var fileHas = defaultProp(file);
    return props.reduce(function (acc, prop) {
      var items = fileHas(prop);
      if (items && items.length) {
        acc[prop] = (acc[prop] || []).concat(items);
      }
      return acc;
    });
  };
}

/**
 * Check for a single property in `file.data`
 *
 * @param  {Object} `file` File object to search
 * @return {Function} Function that takes a `prop` string to search for.
 */

function defaultProp(file) {
  return function (prop) {
    if (!file.data[prop]) {
      return false;
    }
    return !Array.isArray(file.data[prop])
      ? [file.data[prop]]
      : file.data[prop];
  };
}
