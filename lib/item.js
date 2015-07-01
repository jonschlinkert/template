'use strict';

var util = require('util');
var Base = require('./base');
var utils = require('./utils');

/**
 * Create an instance of `Item`.
 *
 * @api public
 */

function Item(obj, collection, app) {
  Base.apply(this, arguments);
  utils.defineProp(this, 'collection', collection);
  utils.defineProp(this, 'app', app);
  this.history = [];
  this.visit('set', obj);
}

util.inherits(Item, Base);

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
  }
});

/**
 * Expose `Item`
 */

module.exports = Item;
