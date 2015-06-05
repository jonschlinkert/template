'use strict';

/**
 * Default last loaders to add objects to the views
 */

module.exports = function (app) {
  var merge = require('mixin-deep');

  var extendViews = function (plural) {
    return function (obj) {
      merge(app.views[plural], obj);
      return obj;
    };
  };

  return {
    sync: extendViews,

    async: function (plural) {
      var fn = extendViews(plural);
      return function (obj, next) {
        try {
          next(null, fn(obj));
        } catch (err) {
          next(new Error(err));
        }
      };
    },

    promise: function (plural) {
      var Promise = require('bluebird');
      return Promise.method(extendViews(plural));
    },

    stream: function (plural) {
      var es = require('event-stream');
      var fn = extendViews(plural);
      return es.through(function () {
        try {
          this.emit('data', fn(obj));
        } catch (err) {
          this.emit('error', err);
        }
      });
    }
  };
};
