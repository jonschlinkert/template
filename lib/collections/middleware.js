'use strict';

var defaultProps = require('./default-props');

/**
 * Default middleware for handling collections
 */

module.exports = function (app, options) {
  if (typeof options.plural === 'undefined') {
    throw new Error('Expected `options.plural` to be a string but got undefined.');
  }
  var renameKey = app.option('renameKey');
  app.collections[options.plural] = app.collections[options.plural] || {};
  var col = app.collections[options.plural];
  col.related = col.related || {};

  var propsFn = (typeof options.props !== 'function')
    ? defaultProps(options.props)
    : options.props;

  return function collections (file, next) {
    if (options.forType.indexOf(file.options.subtype) === -1) {
      return next();
    }
    var items = propsFn(file);
    if (!items || !items.length) {
      return next();
    }
    items.forEach(function (item) {
      if (typeof item === 'boolean' && item) {
        col.related = col.related || {};
        col.related[file.id || renameKey(file.path)] = file;
        return;
      }
      col.items[item] = col.items[item] || {};
      col.items[item].related = col.items[item.related] || {};
      col.items[item].related[file.id || renameKey(file.path)] = file;
    });
    next();
  };
}
