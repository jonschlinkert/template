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
  utils.defineProp(this, 'app', collection.options.app);
  utils.defineProp(this, 'collection', collection);
  utils.defineProp(this, 'options', {});
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
   * Clone a view.
   */

  clone: function() {
    return utils.cloneDeep(this);
  },

  /**
   * Render a view.
   */

  render: function(locals, cb) {
    return this.app.render(this, locals, cb);
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
    utils.defineProp(this.options, key, value);
  },

  /**
   * Mix properties from the given object onto the view instance.
   * Function values will be invoked in the context of the view instance.
   */

  delegate: function(value) {
    for (var key in value) {
      var val = value[key];
      if (typeof val === 'function') {
        utils.defineProp(this, key, val.bind(this));
      } else {
        utils.defineProp(this, key, val);
      }
    }
  },

  /**
   * Private method for forwarding `View` instance methods onto the
   * given object.
   *
   * @param  {Object|Function} `value`
   */

  forward: function(value) {
    return utils.forward(value, this);
  }
};


/**
 * Expose `View`
 */

module.exports = View;
