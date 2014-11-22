'use strict';

var forOwn = require('for-own');
var typeOf = require('kind-of');
var hasOwn = require('./has-own');
var debug = require('./debug');

module.exports = function (template) {
  if (template == null || typeOf(template) !== 'object') {
    debug.err('`template` must be an object.');
  }

  forOwn(template, function (value, key) {
    if (key == null || typeof key !== 'string') {
      debug.err('template `key` must be a string.');
    }

    if (value == null || typeOf(value) === 'object') {
      debug.err('template `value` must be an object.');
    }

    if (!hasOwn(value, 'path')) {
      debug.err('template `value` must have a `path` property.');
    }

    if (!hasOwn(value, 'content')) {
      debug.err('template `value` must have a `content` property.');
    }

    if (!hasOwn(value, 'options')) {
      debug.err('template `value` must have an `options` property.');
    }
  });
};