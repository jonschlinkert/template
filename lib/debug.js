'use strict';

/**
 * Module dependencies
 */

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

function debug (type) {
  var bug = require('debug')(type);
  return function () {
    var args = [].slice.call(arguments);
    args[0] = makeBold(args[0]);
    return bug.apply(bug, args);
  };
}

/**
 * Export `debug` namespaces
 */

module.exports = {
  delims: debug('engine:delims'),
  engine: debug('engine:engine'),
  helper: debug('engine:helper'),
  layout: debug('engine:layout'),
  parser: debug('engine:parser'),
  plugin: debug('engine:plugin'),
  render: debug('engine:render'),
  routes: debug('engine:routes'),
  template: debug('engine:template'),
  utils: debug('engine:utils')
};
