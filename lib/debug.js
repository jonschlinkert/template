'use strict';

/**
 * Module dependencies
 */

var slice = require('array-slice');
var ansi = require('ansi-styles');

function wrapStyles(str, color) {
  return ansi[color].open + str
    + ansi[color].close;
}

function makeBold(str) {
  var re = /\#\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
  var match = re.exec(str);
  if (match) {
    return wrapStyles(match[1], 'bold');
  }
  return str;
}

function debug (namespace) {
  var logger = require('debug')(namespace);
  return function () {
    var args = slice(arguments);
    args[0] = makeBold(args[0]);
    return logger.apply(logger, args);
  };
}

/**
 * Export `debug` namespaces
 */

module.exports = {
  err: debug('template:err'),
  delims: debug('template:delims'),
  engine: debug('template:engine'),
  helper: debug('template:helper'),
  layout: debug('template:layout'),
  loader: debug('template:loader'),
  mixins: debug('template:mixins'),
  parser: debug('template:parser'),
  plugin: debug('template:plugin'),
  render: debug('template:render'),
  routes: debug('template:routes'),
  template: debug('template:template'),
  utils: debug('template:utils')
};
