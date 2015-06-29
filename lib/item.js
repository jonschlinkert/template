'use strict';

var Emitter = require('component-emitter');
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
  Emitter.call(this);
  this.history = [];
  this.visit('set', obj);
}

/**
 * Item methods
 */

Item.prototype = Emitter({
  constructor: Item,

  /**
   * Clone the `item` instance.
   */

  clone: function (obj) {
    return clone(obj || this);
  },

  /**
   * Set a property on item.
   */

  set: function(prop, value) {
    set(this, prop, value);
    return this;
  },

  /**
   * Get a property from item.
   */

  get: function(prop) {
    return get(this, prop);
  },

  /**
   * Run a middleware on `obj`
   */

  use: function(fn) {
    fn.call(this, this);
    return this;
  },

  /**
   * Return a clone of item, without the given keys.
   */

  omit: function(keys) {
    keys = [].concat.apply([], arguments);
    return omit(this.clone(), keys);
  },

  /**
   * Return a clone of item, with only the given keys.
   */

  pick: function(keys) {
    keys = [].concat.apply([], arguments);
    return pick(this.clone(), keys);
  },

  /**
   * Get the keys for the view.
   */

  protoKeys: function(keys) {
    return utils.protoKeys(this).concat(keys || []);
  },

  /**
   * Set or get an option on `item`
   */

  option: function (prop, value) {
    return utils.option(this, prop, value);
  },

  /**
   * Enable an option.
   */

  enable: function (key) {
    return this.option(key, true);
  },

  /**
   * Disable an option.
   */

  disable: function (key) {
    return this.option(key, false);
  },

  /**
   * Return true if `option` is enabled.
   */

  enabled: function (key) {
    return this.options[key] === true;
  },

  /**
   * Return true if `option` is disabled.
   */

  disabled: function (key) {
    return this.options[key] === false;
  },

  /**
   * Track history for an item: Example: `<tracked: preRender>`
   */

  track: function(method, note) {
    if (!this.app.enabled('track changes')) {
      return;
    }
    var state = this.omit('history');
    state.tracked = {location: method, note: note};
    state.inspect = function() {
      return '<' + method + ': ' + note + '>';
    };
    this.options.history = this.options.history || [];
    this.options.history.push(state);
    return this;
  },

  /**
   * Call the given method on each value in `obj`.
   */

  visit: function (method, obj) {
    return utils.visit(this, method, obj);
  }
});

/**
 * Expose `Item`
 */

module.exports = Item;
