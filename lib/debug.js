'use strict';

/**
 * Module dependencies
 */

var debug = require('debug');


/**
 * Export `debug` namespaces
 */

module.exports = {
  delims: debug('template:delims'),
  engine: debug('template:engine'),
  helper: debug('template:helper'),
  layout: debug('template:layout'),
  parser: debug('template:parser'),
  render: debug('template:render'),
  template: debug('template:template'),
  utils: debug('template:utils')
};
