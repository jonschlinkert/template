'use strict';

var extend = require('extend-shallow');
var clone = require('clone-deep');
var get = require('get-value');
var set = require('set-value');
var utils = require('./utils');

/**
 * Create an instance of `View`.
 *
 * @api public
 */

function View(view, collection) {
  this.validate(view);
  this.collection = collection;
  this.app = this.collection.app;
  this.contexts = {};
  this.locals = {};

  view.__proto__ = this;
  return view;
}

/**
 * View methods
 */

View.prototype = {
  constructor: View,

  /**
   * Clone a view.
   */

  clone: function () {
    return clone(this);
  },

  /**
   * Set a property on view.
   */

  set: function(prop, value) {
    set(this, prop, value);
    return this;
  },

  /**
   * Get a property from view.
   */

  get: function(prop) {
    return get(this, prop);
  },

  /**
   * Run a middleware on `view`
   */

  use: function(fn) {
    fn.call(this, this);
    return this;
  },

  /**
   * Render a view.
   */

  render: function(locals, cb) {
    return this.app.render(this, locals, cb);
  },

  /**
   * Build the context for a view.
   *
   * @param  {Function} `fn`
   * @api public
   */

  context: function(locals, name) {
    var ctx = {};
    if (typeof locals === 'function') {
      ctx = locals.call(this, this.data, this.locals);
      if (!ctx || typeof ctx !== 'object') {
        throw new Error('View#context custom functions must return an object.');
      }
      return ctx;
    }
    if (typeof name === 'string') {
      set(this.contexts, name, locals);
    }
    extend(this.locals, locals || {});
    extend(ctx, this.data);
    extend(ctx, this.locals);
    return ctx;
  },

  /**
   * Validate a view.
   */

  validate: function (view) {
    if (!view.content) {
      utils.error('View#validate `content` is a required field: ', view);
    }
    if (!view.path) {
      utils.error('View#validate `path` is a required field: ', view);
    }
  }
};

/**
 * Expose `View`
 */

module.exports = View;
