'use strict';

var Loader = require('load-templates');
var slice = require('array-slice');
var _ = require('lodash');

module.exports = function (template) {
  return function (args, options) {
    var opts = _.merge({}, template.options, options);
    var loader = new Loader(opts);
    return loader.load.apply(loader, args);
  };
};