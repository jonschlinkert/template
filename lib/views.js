'use strict';

var forOwn = require('for-own');
var iterator = require('make-iterator');
var Collections = require('./collections');
var Loader = require('./loader');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views(options, loaders) {
  this.options = options || {};
  this.loaders = loaders || [];
  this.loader = new Loader(options, loaders);
  return this;
}

/**
 * Views methods
 */

Views.prototype = {
  constructor: Views,

  load: function (key, value) {
    return this.set.apply(this, arguments);
  },

  set: function (key, value) {
    this[key] = value;
    return this;
  },

  get: function (key) {
    return this[key];
  },

  use: function (fn) {
    fn.call(this, this);
    return this;
  },

  filter: function (cb) {
    cb = iterator(cb, this);
    var res = {};

    forOwn(this, function (value, key, obj) {
      if (cb(value, key, obj)) res[key] = value;
    });
    return res;
  },

  where: function (obj) {

  }
};

/**
 * Expose `Views`
 */

module.exports = Views;
