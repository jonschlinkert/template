'use strict';

/**
 * Module dependencies
 */

var debug = require('debug');
var bold = require('./bold');

function makeBold (type) {
  var bug = debug(type);
  return function () {
    arguments[0] = bold(arguments[0]);
    return bug.apply(null, arguments);
  };
};

/**
 * Export `debug` namespaces
 */

module.exports = {
  delims: makeBold('template:delims'),
  engine: makeBold('template:engine'),
  helper: makeBold('template:helper'),
  layout: makeBold('template:layout'),
  parser: makeBold('template:parser'),
  render: makeBold('template:render'),
  template: makeBold('template:template'),
  utils: makeBold('template:utils')
};
