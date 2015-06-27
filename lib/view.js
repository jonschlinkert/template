'use strict';

var path = require('path');
var util = require('util');
var pick = require('object.pick');
var extend = require('extend-shallow');
var omit = require('object.omit');
var set = require('set-value');

var utils = require('./utils');
var Item = require('./item');


/**
 * Create an instance of `View`.
 */

function View(view, collection, app) {
  Item.apply(this, arguments);
  utils.defineProp(this, 'collection', collection);
  utils.defineProp(this, 'app', app);
  this.init(view);
  return view;
}

util.inherits(View, Item);

/**
 * View prototype methods
 */

utils.object.delegate(View.prototype, {

  /**
   * Initialize view with base properties.
   */

  init: function (view) {
    // ensure that `view` has `path` and `content` properties
    this.validate(view);
    this.listen(view);

    this.options = view.options || {};
    this.options.orig = view.content;
    this.options.viewType = this.options.viewType = [];
    this.options.handled = this.options.handled = [];

    this.contexts = view.contexts = {};
    this.locals = view.locals || {};
    this.data = view.data || {};

    // add non-emumerable properties
    utils.defineProp(this.options, 'route', this.options.route);
    utils.defineProp(this, '_callbacks', this._callbacks);

    extend(view, this);
    view.__proto__ = this;
    this.app.handle('onLoad', view, view.locals);

    this.ctx('locals', view.locals);
    this.ctx('matter', view.data);
  },

  /**
   * Listen for events on `view`
   */

  listen: function (view) {
    this.on('handle', function (method) {
      view.track('handle', method);
    });
  },

  /**
   * Get the engine name for a view.
   */

  getEngine: function(locals) {
    locals = locals || {};
    var engine = locals.engine
      || this.data.engine
      || this.locals.engine
      || path.extname(this.path);

    if (engine[0] !== '.') {
      engine = '.' + engine;
    }
    return engine;
  },

  /**
   * Render a view.
   */

  render: function(locals, cb) {
    return this.app.render(this, locals, cb);
  },

  /**
   * Track a context.
   */

  ctx: function(name, obj) {
    this.contexts[name] = this.contexts[name] || {};
    extend(this.contexts[name], obj);
    return this;
  },

  /**
   * Get an option from either the view, collection, or app instance,
   * in that order.
   */

  pickOption: function(key) {
    return this.options[key]
      || this.collection.options[key]
      || this.app.options[key];
  },

  /**
   * Build the context for a view.
   *
   * @param  {Function} `fn`
   * @api public
   */

  context: function(locals, fn) {
    if (typeof locals === 'function') {
      fn = locals;
      locals = {};
    }

    fn = fn || this.pickOption('context');
    var keys = ['compile', 'render', 'matter', 'locals', 'helper', 'custom'];
    var res = {};

    function calculate(ctx, props, contexts) {
      var len = props.length, i = 0;
      while (len--) {
        var key = props[i++];
        extend(ctx, contexts[key] || {});
      }
    }

    if (typeof fn === 'function') {
      fn.call(res, keys, this.contexts, calculate);
      if (!res || typeof res !== 'object') {
        throw new Error('custom context functions must return a context object.');
      }
      this.ctx('custom', res);
      return this;
    }

    calculate(res, keys, this.contexts);
    extend(res, locals);
    return res;
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
});

/**
 * Expose `View`
 */

module.exports = View;
