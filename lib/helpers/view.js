'use strict';

var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('get-value', 'get');
lazy('for-in');
lazy('for-own');

module.exports = function (app, collection, view, options) {
  // var helpers = {

  //   /**
  //    * Get a value from `view`
  //    */

  //   get: function (prop) {
  //     return lazy.get(view, prop);
  //   },

  //   /**
  //    * Get an option from `view`
  //    */

  //   option: function(prop) {
  //     return lazy.get(view.options, prop);
  //   },

  //   /**
  //    * Iterate over the 'own' keys in `view`.
  //    */

  //   forOwn: function (cb) {
  //     var res = {};
  //     lazy.forOwn(this, function (value, key, obj) {
  //       if (cb(value, key, obj)) {
  //         res[key] = value;
  //       }
  //     }, this);
  //     return res;
  //   },

  //   /**
  //    * Iterate over the keys in `view`
  //    */

  //   forIn: function (cb) {
  //     var res = {};
  //     lazy.forIn(this, function (value, key, obj) {
  //       if (cb(value, key, obj)) {
  //         res[key] = value;
  //       }
  //     }, this);
  //     return res;
  //   }
  // };

  // return helpers;
};
