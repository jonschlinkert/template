'use strict';

var util = require('util');
var path = require('path');
var Collection = require('./collection');
var utils = require('./utils');
var View = require('./view');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views() {
  Collection.apply(this, arguments);
  utils.defineProp(this, 'data', {});
}

util.inherits(Views, Collection);

/**
 * Views prototype methods
 */

utils.object.delegate(Views.prototype, {

  /**
   * Set a view on the collection.
   */

  set: function (key, val) {
    this.app.keep(val.path, key, this.options.collection);
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
    var app = this.app;
    if (typeof view === 'string') {
      view = this[view];
    }
    app.render.apply(app, [view].concat(args));
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
    this.options.viewType = utils.arrayify(this.options.viewType || []);
    if (this.options.viewType.length === 0) {
      this.options.viewType.push('renderable');
    }
    return this.options.viewType;
  },

  /**
   * Rename template keys.
   */

  renameKey: function (fp, fn) {
    if (typeof fn !== 'function') {
      fn = this.options.renameKey;
    }
    if (typeof fn !== 'function') {
      fn = path.basename;
    }
    return fn(fp);
  }
});

/**
 * Expose `Views`
 */

module.exports = Views;
