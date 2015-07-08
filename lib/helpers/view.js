'use strict';

var forIn = require('for-in');
var forOwn = require('for-own');
var get = require('get-value');

module.exports = function (app, collection, view, options) {
  var helpers = {

    /**
     * Get a value from `view`
     */

    get: function (prop) {
      return get(view, prop);
    },

    /**
     * Get an option from `view`
     */

    option: function(prop) {
      return get(view.options, prop);
    },

    /**
     * Iterate over the 'own' keys in `view`.
     */

    forOwn: function (cb) {
      var res = {};
      forOwn(this, function (value, key, obj) {
        if (cb(value, key, obj)) {
          res[key] = value;
        }
      }, this);
      return res;
    },

    /**
     * Iterate over the keys in `view`
     */

    forIn: function (cb) {
      var res = {};
      forIn(this, function (value, key, obj) {
        if (cb(value, key, obj)) {
          res[key] = value;
        }
      }, this);
      return res;
    }
  };

  return helpers;
};
