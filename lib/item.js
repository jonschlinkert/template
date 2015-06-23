'use strict';

var clone = require('clone-deep');
var omit = require('object.omit');
var pick = require('object.pick');
var get = require('get-value');
var set = require('set-value');
var utils = require('./utils');

/**
 * Create an instance of `Item`.
 *
 * @api public
 */

function Item(obj) {
  this.history = [];
  return obj;
}

/**
 * Item methods
 */

Item.prototype = {
  constructor: Item,

  /**
   * Clone a obj.
   */

  clone: function () {
    return clone(this);
  },

  /**
   * Set a property on obj.
   */

  set: function(prop, value) {
    set(this, prop, value);
    return this;
  },

  /**
   * Get a property from obj.
   */

  get: function(prop) {
    return get(this, prop);
  },

  /**
   * Return a clone of item, without the given keys.
   */

  omit: function(keys) {
    return omit(this.clone(), keys);
  },

  /**
   * Return a clone of item, with only the given keys.
   */

  pick: function(keys) {
    return pick(this.clone(), keys);
  },

  /**
   * Track history for an item: Example: `<tracked: preRender>`
   */

  track: function(method) {
    var changes = this.omit('history');

    changes.inspect = function() {
      return '<tracked: ' + method + '>';
    };
    this.history.push(changes);
    return this;
  },

  /**
   * Run a middleware on `obj`
   */

  use: function(fn) {
    fn.call(this, this);
    return this;
  },

  /**
   * Define a non-enumerable option property.
   */

  defineOption: function(key, value) {
    utils.defineProp(this.options, key, value);
    return this;
  }
};

/**
 * Expose `Item`
 */

module.exports = Item;
