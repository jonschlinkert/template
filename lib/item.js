'use strict';

var util = require('util');
var Base = require('./base');
var utils = require('./utils');

/**
 * Create an instance of `Item`.
 *
 * @api public
 */

function Item(options) {
  // Base handles adding `options, data, _cache, app`
  Base.call(this, options);
  utils.defineProp(this, 'collection', this.options.collection);
}

Base.extend(Item);

Item.extend = function(obj) {
  util.inherits(obj, Item);
};

/**
 * Item methods
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
