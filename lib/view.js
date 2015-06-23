'use strict';

var path = require('path');
var util = require('util');
var Emitter = require('component-emitter');
var extend = require('extend-shallow');
var clone = require('clone-deep');
var get = require('get-value');
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
  Emitter.call(this);
  this.validate(view);
  this.init(view);
  this.app = app;
  view.__proto__ = this;
  app.handle('onLoad', view, this.locals);
  return view;
}

util.inherits(View, Item);
Emitter(View.prototype);

/**
 * View prototype methods
 */

utils.defineProps(View.prototype, {

  /**
   * Listen for events on `view`
   */

  listen: function () {
    this.on('option', function (key, value) {
      if (key === 'viewType') {
        this.options[key] = utils.arrayify(value);
      }
    });

    this.on('handle', function (key) {
      this.track(key);
    });
  },

  /**
   * Initialize a view.
   */

  init: function (view) {
    this.options = {};
    this.listen();

    this.options.viewType = [];
    this.options.methods = [];
    this.defineOption('route', this.options.route);
    this.contexts = {};
    this.locals = {};
    this.data = {};
    extend(view, this);
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
   * Set or get an option on `view`
   */

  option: function (prop, value) {
    if (typeof prop === 'object') {
      for (var key in prop) {
        if (prop.hasOwnProperty(key)) {
          this.option(key, prop[key]);
        }
      }
    } else {
      this.options[prop] = value;
      this.emit('option', prop, value);
    }
    return this;
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
});

/**
 * Expose `View`
 */

module.exports = View;
