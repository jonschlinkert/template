'use strict';

var util = require('util');
var path = require('path');
var extend = require('extend-shallow');
var Collection = require('./collection');
var utils = require('./utils');
var View = require('./view');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views(/*options, loaders, app*/) {
  Collection.apply(this, arguments);
}

util.inherits(Views, Collection);

/**
 * Views prototype methods
 */

utils.defineProps(Views.prototype, {

  /**
   * Load views.
   */

  load: function (key, value) {
    var args = [].slice.call(arguments);
    var last = args[args.length - 1];
    if (typeof last === 'function') {
      var fn = args.pop();
      var res = fn.apply(fn, args);
      for (var key in res) {
        if (res.hasOwnProperty(key)) {
          this.set(key, res[key]);
        }
      }
      return this;
    }
    return this.set.apply(this, arguments);
  },

  /**
   * Set a view.
   */

  set: function (key, value) {
    this.app.stash.set(key, this.options.collection);
    this[key] = new View(value, this, this.app);
    return this;
  },

  /**
   * Set view types for the collection.
   *
   * @param {String} `plural` e.g. `pages`
   * @param {Object} `options`
   * @api private
   */

  viewType: function() {
    this.options.viewType = this.options.viewType || 'renderable';
    return utils.arrayify(this.options.viewType);
  },

  /**
   * Rename template keys.
   */

  renameKey: function (fp, options) {
    var opts = extend({}, this.options, options);
    var fn = opts.renameKey || path.basename;
    return fn(fp);
  }
});

/**
 * Expose `Views`
 */

module.exports = Views;
