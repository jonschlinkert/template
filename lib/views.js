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

function Views(opts) {
  Collection.apply(this, arguments);
  utils.defineProp(this, 'data', {});
  this.init(opts);
}

util.inherits(Views, Collection);

/**
 * Views prototype methods
 */

utils.defineProps(Views.prototype, {

  init: function (opts) {
    var app = this.app;
    var self = this;
    app.loaders.on('first', function (args, stack) {
      if (stack.length === 0) stack.push(self.firstLoader(opts));
    });
    app.loaders.on('last', function (args, stack) {
      if (stack.length === 0) stack.push(self.lastLoader(opts));
    });
    app.loaders.on('load', function (args, stack) {
      if (stack.length === 0) {
        throw new Error('no loaders were registered for: ' + opts.collection);
      }
    });
  },

  /**
   * Set a view on the collection.
   */

  set: function (key, val) {
    this.app.handle('onLoad', val, val.locals);
    this[key] = new View(val, this, this.app);
    return this;
  },

  /**
   * Load views onto the collection.
   */

  loader: function(/*options, stack*/) {
    var set = this.app.loaders.set;
    var args = [].slice.call(arguments);
    var name = this.options.collection;
    set.apply(set, [name].concat(args));
    return this;
  },

  /**
   * Render a view in the collection.
   *
   * @param  {String|Object} `view` View key or object.
   * @param  {Object} `locals`
   * @param  {Function} `fn`
   * @return {Object}
   */

  render: function (view/*, locals, fn*/) {
    var args = [].slice.call(arguments, 1);
    args = [this[view] || view].concat(args);
    return this.app.render.apply(this.app, args);
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
