'use strict';

var util = require('util');
var lazy = require('lazy-cache')(require);
var copy = lazy('copy');
var write = lazy('write');
var mixin = require('mixin-object');
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

function Item(item, options) {
  Base.call(this, options);
  this.define('collection', this.options.collection);
  this.initItem(item, options);
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

  initItem: function (item, options) {
    if (typeof item === 'object') {
      this.visit('set', item);
    } else {
      item = {};
    }
    if (this.path) {
      this.src = this.src || {};
      this.src.path = this.path;
    }
    if (Buffer.isBuffer(this.contents)) {
      this.content = this.contents.toString();
    }
    if (this.content) {
      this.options.orig = this.content;
    }
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
  },

  /**
   * Write the item to disk asynchronously.
   *
   * @param {String} `fp` Destination filepath.
   * @param {Function} `cb` Callback function
   * @returns {Object} Returns the instance for chaining.
   * @api public
   */

  write: function (fp, cb) {
    if (typeof fp === 'function') {
      cb = fp;
      fp = null;
    }

    if (typeof cb !== 'function') {
      throw new Error('async `write` was called without a callback function.');
    }

    var dest = fp || this.dest.path;
    var src = this.src.path;
    var str = this.content;

    if (str) {
      write()(dest, str, cb);
    } else {
      copy()(src, dest, cb);
    }

    this.emit('write', dest);
    return this;
  },

  /**
   * Write the item to disk synchronously.
   *
   * @param  {String} `fp` Destination filepath.
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  writeSync: function (fp) {
    var dest = fp || this.dest.path;
    var src = this.src.path;
    var str = this.content;

    if (str) {
      write().sync(dest, str);
    } else {
      copy().sync(src, dest);
    }

    this.emit('write', dest);
    return this;
  }
});

/**
 * Expose `Item`
 */

module.exports = Item;
