'use strict';

var path = require('path');
var util = require('util');
var extend = require('extend-shallow');
var set = require('set-value');
var helpers = require('./helpers/view');
var utils = require('./utils');
var Item = require('./item');

/**
 * Create an instance of `View`.
 */

function View(view) {
  Item.apply(this, arguments);
  this.init(view);
  return view;
}

util.inherits(View, Item);

/**
 * View prototype methods
 */

utils.delegate(View.prototype, {

  /**
   * Initialize view with base properties.
   */

  init: function (view) {
    // ensure that `view` has `path` and `content` properties
    this.validate(view);
    this.listen(view);

    this.options = view.options || {};
    this.options.collection = this.collection.options.collection;
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

    this.app.handleView('onLoad', view, view.locals);
    this.ctx('locals', view.locals);
    this.ctx('data', view.data);
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

    // fallback on collection engine
    if (!engine) {
      engine = this.pickOption('engine');
    }

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
   * Get the basename of a view path.
   */

  renameKey: function(key) {
    // var fn = this.pickOption('renameKey');
    // if (!fn) {
    //   fn = this.collection.renameKey || this.app.renameKey;
    // }
    // return fn(key);
  },

  permalink: function (locals) {
    var data = this.context(locals);
    data.permalink = data.permalink || this.pickOption('permalink');

    var res = data.permalink.replace(/:(\w+)/g, function (m, prop) {
      return data[prop];
    });
    return res;
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

    var data = this.app.cache.data;
    var name = this.collection.renameKey(this.path);
    var res = this.locals;

    // extend context with same-named data-property from `app.cache.data`
    if (!this.extended) {
      this.extended = true;
      this.ctx('data', data[name] || data);
    }
    this.ctx('data', this.data);
    // this.ctx('options', this.options);

    var keys = ['compile', 'render', 'data', 'locals', 'helper', 'custom'];
    fn = fn || this.pickOption('context');
    locals = locals || {};

    if (this.pickOption('prefer locals') === false) {
      keys = ['compile', 'render', 'locals', 'data', 'helper', 'custom'];
    }

    function calculate(obj, contexts, props) {
      var len = props.length, i = 0;
      while (len--) {
        var key = props[i++];
        extend(obj, contexts[key] || {});
      }
    }

    if (typeof fn === 'function') {
      fn.call(this, res, this.contexts, keys, calculate);
    } else {
      calculate(res, this.contexts, keys);
    }

    extend(this.locals, this.app.mergePartials(locals));
    extend(this.locals, res, locals);
    res.overrides = helpers(this.app, this.collection, this, this.options);
    return res;
  },

  /**
   * Validate a view.
   */

  validate: function (view) {
    if (typeof view.content === 'undefined') {
      utils.error('View#validate `content` is a required field: ', view);
    }
    if (typeof view.path === 'undefined') {
      utils.error('View#validate `path` is a required field: ', view);
    }
  }
});

/**
 * Expose `View`
 */

module.exports = View;
