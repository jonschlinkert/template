'use strict';

var Loader = require('load-templates');
var extend = require('extend-shallow');
var fileProps = ['history', 'base', 'relative', 'path', 'cwd', 'engine'];

/**
 * Default loader for Template
 */

module.exports = function (app) {
  return function (args, options) {
    args = Array.isArray(args) ? args : [args];

    var opts = extend({rootKeys: fileProps}, app.options, options);
    var loader = new Loader(opts);
    var res = loader.load.apply(loader, args);
    return res;
  };
};
