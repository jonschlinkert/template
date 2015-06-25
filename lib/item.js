'use strict';

var Emitter = require('component-emitter');
var clone = require('clone-deep');
var omit = require('object.omit');
var pick = require('object.pick');
var get = require('get-value');
var set = require('set-value');
var shared = require('./shared');
var utils = require('./utils');

/**
 * Create an instance of `Item`.
 *
 * @api public
 */

function Item(obj) {
  Emitter.call(this);
  this.history = [];
  return obj;
}

/**
 * Item methods
 */

Item.prototype = Emitter({
  constructor: Item,

  /**
   * Clone the `item` instance.
   */

  clone: function (prop) {
    return clone(prop ? this[prop] : this);
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
    return omit(this.clone(), keys);
  },

  /**
   * Return a clone of item, with only the given keys.
   */

  pick: function(keys) {
    return pick(this.clone(), keys);
  },

  /**
   * Get the keys for the view.
   */

  keys: function(keys) {
    var proto = Object.getPrototypeOf(this);
    return Object.keys(proto);
  },

  /**
   * Set or get an option on `item`
   */

  option: function (prop, value) {
    return shared.option(this, prop, value);
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
    if (!this.enabled('track changes')) {
      return;
    }
    var changes = this.omit('history');
    changes.tracked = {location: method, note: note};

    changes.inspect = function() {
      return '<' + method + ': ' + note + '>';
    };
    this.history.push(changes);
    return this;
  },

  /**
   * Review history for an item.
   *
   * @param {Array|String} `props` Specific keys to review.
   */

  review: function(props) {
    if (!this.enabled('track changed')) {
      console.log('View#review: `track changes` is disabled.');
      return;
    }
    props = props || Object.keys(this);
    this.history.forEach(function (item) {
      var name = item.tracked.location
        + ' (' + item.tracked.note + ')';

      item.inspect = function () {
        return name + ': ' + JSON.stringify(this.pick(props), null, 2);
      }.bind(this);

      console.log(item);
    }.bind(this));
  },

  /**
   * Define a non-enumerable property.
   */

  defineProp: function(key, value) {
    utils.defineProp(this, key, value);
    return this;
  },

  /**
   * Define a non-enumerable option property.
   */

  defineOption: function(key, value) {
    utils.defineProp(this.options, key, value);
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
