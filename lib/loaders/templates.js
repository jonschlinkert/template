'use strict';

var Loader = require('load-templates');
var extend = require('extend-shallow');
var fileProps = ['history', 'base', 'relative', 'path', 'cwd', 'engine'];

/**
 * Default loader for Template
 */

module.exports = function (app) {
  var wrapper = function () {
    console.log('wrapper arguments', arguments);
    var opts = extend({rootKeys: fileProps}, app.options);
    var loader = new Loader(opts);
    var res = loader.load.apply(loader, arguments);
    console.log('res', res);
    return res;
  };
  return {
    sync: wrapper,
    async: function () {
      var args = [].slice.call(arguments);
      var next = args.pop();
      try {
        var res = wrapper.apply(wrapper, args);
        next(null, res);
      } catch (err) {
        next(new Error(err));
      }
    },
    promise: function () {
      var Promise = require('bluebird');
      return Promise.method(wrapper);
    },
    stream: function () {
      console.log('stream arguments', arguments);
      var es = require('event-stream');
      return es.through(function () {
        var res = wrapper.apply(wrapper, arguments);
        this.emit('data', res);
      });
    }
  };
};
