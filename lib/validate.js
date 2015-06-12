'use strict';

var typeOf = require('kind-of');
var debug = require('./debug');

module.exports = function (template, next) {
  var error;
  if (typeOf(template) !== 'object') {
    error = this.error('validate', 'templates are expected to be objects.');
    if (next) return next(error);
    throw error;
  }

  if (!template.path) {
    error = this.error('validate', 'template.path must be a string.');
    if (next) return next(error);
    throw error;
  }

  if (typeOf(template.content) !== 'string') {
    error = this.error('validate', 'template.content must be a string.');
    if (next) return next(error);
    throw error;
  }
  next();
};
