'use strict';

var path = require('path');
var util = require('util');
var extend = require('extend-shallow');

/**
 * Lazily required dependencies
 */

var lazy = require('lazy-cache')(require);
var assign = lazy('assign-value');
var clone = lazy('clone-deep');
var omit = lazy('object.omit');

/**
 * Local dependencies
 */

var mixins = require('./mixins/view');
var utils = require('./utils');
var Item = require('./item');

/**
 * Create an instance of `View`.
 */

function View(view, options) {
  Item.call(this, options);
  this.init(view);
  return view;
}

/**
 * Inherit `Item`
 */

Item.extend(View);

/**
 * Expose `extend`, to allow other classes to inherit
 * from the `View` class.
 *
 * ```js
 * function MyCustomView(options) {...}
 * View.extend(MyCustomView);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `View`
 * @return {undefined}
 * @api public
 */

View.extend = function (Ctor) {
  util.inherits(Ctor, View);
};

/**
 * `View` prototype methods
 */

utils.delegate(View.prototype, {
  constructor: View,

  /**
   * Initialize view with base properties.
   */

  init: function (view) {
    // ensure that `view` has `path` and `content` properties
    this.validate(view);

    // start listening for `view` events
    this.listen(view);

    this.options.orig = view.content;
    this.options.plural = this.collection.options.plural;
    this.options.viewType = this.options.viewType = [];
    this.options.handled = this.options.handled = [];

    this.contexts = view.contexts = {};
    this.locals = view.locals || {};
    this.data = view.data || {};
    this.dest = view.dest || {};

    this.src = view.src || {};
    this.src.path = this.src.path || this.path;
    mixins(this);

    // add non-emumerable properties
    utils.defineProp(this.options, 'route', this.options.route);
    utils.defineProp(this, '_callbacks', this._callbacks);
    view.__proto__ = this;

    // handle `onLoad` middleware routes
    this.app.handleView('onLoad', view, view.locals);
    this.ctx('locals', view.locals);
    this.ctx('data', view.data);
  },

  /**
   * Return a clone of the view instance.
   */

  clone: function (keys) {
    var Parent = this.constructor;
    var opts = clone()(this.options);
    var res = {};

    omit()(this, keys, function (val, key) {
      res[key] = clone()(val);
    });
    return new Parent(res, opts);
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
  * Compile a view. This is a synchronous method.
  *
  * ```js
  * var view = page.compile();
  * console.log(view.fn({title: 'A'}));
  * console.log(view.fn({title: 'B'}));
  * console.log(view.fn({title: 'C'}));
  * ```
  *
  * @param  {Object} `locals` Optionally pass locals to the engine.
  * @return {Object} `View` instance, for chaining.
  * @api public
  */

  compile: function(locals) {
    this.app.compile(this, locals);
    return this;
  },

 /**
  * Asynchronously render a view.
  *
  * ```js
  * pages.get('home.md')
  *   .render({title: 'Home'}, function(err, res) {
  *      //=> do stuff with `res`
  *   });
  * ```
  *
  * @param  {Object} `locals` Optionally pass locals to the engine.
  * @return {Object} `View` instance, for chaining.
  * @api public
  */

  render: function(locals, cb) {
    if (typeof locals === 'function') {
      return locals.call(this);
    }
    this.app.render(this, locals, cb);
    return this;
  },

  /**
   * Get the basename of a view path.
   */

  renameKey: function(key) {
    var fn = this.pickOption('renameKey');
    if (!fn) {
      fn = this.collection.renameKey || this.app.renameKey;
    }
    if (typeof fn !== 'function') return key;
    return fn(key);
  },

  /**
   * Track a context.
   */

  ctx: function(name, obj) {
    assign()(this.contexts, name, obj);
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
    if (!this.options.extended) {
      this.options.extended = true;
      this.ctx('data', data[name] || data);
    }

    this.ctx('data', this.data);
    this.ctx('options', this.options);

    var keys = ['compile', 'render', 'options', 'data', 'locals', 'helper', 'custom'];
    fn = fn || this.pickOption('context');
    locals = locals || {};

    if (this.pickOption('prefer locals') === false) {
      keys = ['compile', 'render', 'options', 'locals', 'data', 'helper', 'custom'];
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
 * Ensure that the `layout` property is set on a view.
 */

Object.defineProperty(View.prototype, 'layout', {
  set: function(val) {
    utils.defineProp(this, '_layout', val);
  },
  get: function() {
    return this._layout || this.data.layout || this.locals.layout || this.options.layout;
  }
});

/**
 * Expose `View`
 */

module.exports = View;
