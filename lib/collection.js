'use strict';

var util = require('util');
var forIn = require('for-in');
var forOwn = require('for-own');
var Emitter = require('component-emitter');
var extend = require('extend-shallow')
var get = require('get-value');
var set = require('set-value');
var Base = require('./base');
var utils = require('./utils');

/**
 * Create an instance of `Collection`.
 *
 * @api public
 */

function Collection(app, loaders, options) {
  Base.apply(this, arguments);
  utils.defineProp(this, 'options', options);
  utils.defineProp(this, '_callbacks', this._callbacks);
  utils.defineProp(this, 'app', app);
}

util.inherits(Collection, Base);

/**
 * Collection methods
 */

utils.delegate(Collection.prototype, {

  /**
   * Set or get data on the collection.
   */

  data: function (prop, value) {
    utils.data(this, prop, value);
    return this;
  },

  /**
   * Wrapper function for exposing the collection instance
   * to loaders.
   *
   * @param {Object} `options`
   * @param {Function} `fn` Loader function
   */

  wrap: function (options, fn) {
    return fn(this, options);
  }
});

/**
 * Expose `Collection`
 */

module.exports = Collection;
