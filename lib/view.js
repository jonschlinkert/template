'use strict';

var extend = require('extend-shallow');
var utils = require('./utils');

/**
 * Create a new `View` with the given `view`, `options` and
 * an instance of the `collection`.
 *
 * @param {Object} `view`
 * @param {Object} `options`
 * @param {Object} `collection`
 */

function View(view, options, collection) {
  utils.mixin(this, 'app', collection.options.app);
  utils.mixin(this, 'collection', collection);
  utils.mixin(this, 'options', {});

  this.app.handle('onLoad', view);
  view.__proto__ = this;
  return view;
}

/**
 * Prototype methods.
 */

View.prototype = {
  constructor: View,

  /**
   * Build the context for a view.
   *
   * @param  {Function} `fn`
   * @api public
   */

  context: function(data) {
    var ctx = {};
    if (typeof data === 'function') {
      ctx = data.call(this, this.data, this.locals);
      if (!ctx || typeof ctx !== 'object') {
        throw new Error('View#context custom functions must return an object.');
      }
      return ctx;
    }
    extend(ctx, this.data);
    extend(ctx, this.locals);
    extend(ctx, data || {});
    return ctx;
  },

  /**
   * Set a property on view.
   */

  set: function(prop, value) {
    utils.set(this, prop, value);
    return this;
  },

  /**
   * Get a property from view.
   */

  get: function(prop) {
    return utils.getProp(this, prop);
  },

  /**
   * Run a middleware on `view`
   */

  use: function(fn) {
    fn(this);
    return this;
  },

  /**
   * Render a view.
   */

  render: function(locals, cb) {
    this.app.render(this, locals, cb);
    return this;
  },

  /**
   * Get related views from the collection instance.
   */

  related: function(prop, options) {
    // todo: this is pseudo-code
    var value = utils.getProp(this, prop);
    return this.collection.filter(prop, value, options);
  },

  /**
   * Register a context for a view.
   */

  addContext: function(prop, val) {
    return utils.set(this.contexts, prop, val);
  },

  /**
   * Define a non-enumerable option property
   */

  defineOption: function(key, value) {
    utils.mixin(this.options, key, value);
  },

  /**
   * Mix the properties of the given object onto the view instance.
   */

  mixin: function(value) {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        var val = value[key];
        if (typeof val === 'function') {
          utils.mixin(this, key, val.bind(this));
        } else {
          utils.mixin(this, key, val);
        }
      }
    }
  }
};


/**
 * Expose `View`
 */

module.exports = View;
