'use strict';

var util = require('util');
var get = require('get-value');
var set = require('set-value');
var extend = require('extend-shallow');
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
}

util.inherits(Item, Base);

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

  // pickOption: function(prop, options) {
  //   function pickOpt() {
  //     return this.option(prop)
  //       || this.collection.option(prop)
  //       || this.app.option(prop)
  //       || {};
  //   }
  //   var opts = this.cache(prop, pickOpt);
  //   extend(opts, options);
  //   return opts;
  // },
  pickOption: function(prop) {
    return this.option(prop)
      || this.collection.option(prop)
      || this.app.option(prop)
  },
});

/**
 * Expose `Item`
 */

module.exports = Item;
