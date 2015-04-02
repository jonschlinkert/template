'use strict';

var Loader = require('load-templates');
var extend = require('extend-shallow');

/**
 * Default loader for Template
 */

module.exports = function (app) {
  return function (args, options) {
    args = Array.isArray(args) ? args : [args];
    var opts = extend({}, app.options, options);
    var loader = new Loader(opts);
    return loader.load.apply(loader, args);
  };
};
