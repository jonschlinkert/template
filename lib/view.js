'use strict';

var path = require('path');
var util = require('util');
var clone = require('clone-deep');
var extend = require('extend-shallow');
var merge = require('mixin-deep');
var clone = require('clone-deep');
var omit = require('object.omit');
var set = require('set-value');
var utils = require('./utils');
var Item = require('./item');

/**
 * Create an instance of `View`.
 *
 * @api public
 */

function View(view, collection, app) {
  Item.apply(this, arguments);
  utils.defineProp(this, 'app', app);
  this.validate(view);
  this.init(view);
  view.__proto__ = this;
  return view;
}

util.inherits(View, Item);

/**
 * View prototype methods
 */

utils.object.delegate(View.prototype, {

  /**
   * Initialize a view.
   */

  init: function (view) {
    this.viewListen();

    // this.extend({
    //   options: {
    //     viewType: [],
    //     handled: [],
    //     route: null
    //   },
    //   contexts: {},
    //   locals: {},
    //   data: {}
    // });

    this.options = clone(view.options || {});
    this.options.orig = view.content;
    this.options.viewType = this.options.viewType = [];
    this.options.handled = this.options.handled = [];

    this.defineOption('route', this.options.route);
    this.defineProp('_callbacks', this._callbacks);
    this.contexts = view.contexts = {};
    this.locals = view.locals || {};
    this.data = view.data || {};
    merge(view, this);
    this.app.handle('onLoad', view, view.locals);
  },

  /**
   * Listen for events on `view`
   */

  viewListen: function () {
    this.on('handle', function (method) {
      this.track('handle', method);
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

  extend: function() {
    var args = [].slice.call(arguments);
    return extend.apply(extend, [this].concat(args));
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
      set(this.contexts, name, clone(locals));
    }
    extend(this.locals, locals || {});
    extend(ctx, this.data);
    extend(ctx, this.locals);
    extend(ctx, ctx.locals);
    return omit(ctx, ['locals']);
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
