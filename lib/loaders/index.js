'use strict';

var Loader = require('load-templates');
var slice = require('array-slice');
var _ = require('lodash');

module.exports = function (plural, options) {
  return function () {
    var opts = _.merge({}, this.options, options);
    var loader = new Loader(opts);
    var args = slice(arguments);
    var next = args.pop();
    var value = loader.load.apply(loader, args);
    var res = this.normalize(plural, value, options);
    next(null, res);
  };
};