'use strict';

var util = require('util');
var Base = require('./base');
var utils = require('./utils');

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

function Item(options) {
  Base.call(this, options);
  utils.defineProp(this, 'collection', this.options.collection);
}

/**
 * Inherit `Base`
 */

Base.extend(Item);

/**
 *
 * Expose `extend`, static method for allowing other classes to inherit
 * from the `Item` class (and receive all of Item's prototype methods).
 *
 * ```js
 * function MyCustomItem(options) {...}
 * Item.extend(MyCustomItem);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `Item`
 * @return {undefined}
 * @api public
 */

Item.extend = function(obj) {
  util.inherits(obj, Item);
};

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
    return this.option(prop)
      || (this.collection && this.collection.option(prop))
      || (this.app && this.app.option(prop));
  }
});

/**
 * Expose `Item`
 */

module.exports = Item;
