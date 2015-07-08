'use strict';

var util = require('util');
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
  },

  /**
   * Return stash or this with prototype methods.
   */

  value: function () {
    if (this.hasOwnProperty('stash')) {
      utils.delegateAll(this.stash, Collection.prototype);
      return this.stash;
    }
    return this;
  },

  /**
   * Get an option from the collection or app instance,
   * in that order.
   */

  pickOption: function(key) {
    return this.options[key]
      || this.app.options[key];
  }

});

/**
 * Expose `Collection`
 */

module.exports = Collection;
