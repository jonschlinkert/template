'use strict';

var get = require('get-value');
var set = require('set-value');

var shared = module.exports;

shared.option = function option(thisArg, prop, value) {
  var len = arguments.length;
  var type = typeof prop;

  if (type === 'string' && len === 1) {
    return get(thisArg.options, prop);
  } else if (type === 'object') {
    thisArg.visit('option', prop);
    return thisArg;
  }
  set(thisArg.options, prop, value);
  thisArg.emit('option', prop, value);
  return thisArg;
};
