'use strict';

var util = require('util');
var lazy = require('lazy-cache')(require);
var Base = require('./base');
var utils = require('./utils');

lazy('extend-shallow', 'extend');

/**
 * Create an instance of `Item` with the specified `options`.
 * The `Item` constructor inherits from Base.
 *
 * ```js
 * var item = new Item();
 * ```
 * @param {Object} `options`
 * @return {undefined}
 * @api public
 */

function Item(item, options) {
  Base.call(this, options);
  this.define('collection', this.options.collection);

  if (typeof item === 'object') {
    this.visit('set', item);
  }
}

/**
 * Inherit `Base`
 */

Base.extend(Item);

/**
 * `Item` prototype methods
 */

utils.delegate(Item.prototype, {
  constructor: Item,

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
   * Get an option from the item, collection or app instance,
   * in that order.
   */

  pickOption: function(prop) {
    var opt = this.option(prop);
    if (typeof opt === 'undefined') {
      opt = this.collection && this.collection.option(prop);
    }
    if (typeof opt === 'undefined') {
      return this.app && this.app.option(prop);
    }
    return opt;
  }
});

/**
 *
 * Expose `extend`, static method for allowing other classes to inherit
 * from the `Item` class (and receive all of Item's prototype methods).
 *
 * ```js
 * function MyItem(options) {...}
 * Item.extend(MyItem);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `Item`
 * @return {undefined}
 * @api public
 */

Item.extend = function(Ctor) {
  util.inherits(Ctor, Item);
  lazy.extend(Ctor, Item);
};

/**
 * Expose `Item`
 */

module.exports = Item;
