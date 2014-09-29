'use strict';

/**
 * Module dependencies
 */

var bold = require('./bold');

function debug (type) {
  var bug = require('debug')(type);
  return function () {
    var args = [].slice.call(arguments);
    args[0] = bold(args[0]);
    return bug.apply(bug, args);
  };
}

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
