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
var get = lazy('get-value');
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
  Item.call(this, view, options);
  this.initView(view);
  return view;
}

/**
 * Inherit `Item`
 */

Item.extend(View);

/**
 * `View` prototype methods
 */

utils.delegate(View.prototype, {
  constructor: View,

  /**
   * Initialize view with base properties.
   */

  initView: function (view) {
    // getter/setter
    this.path = view.path;
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
    mixins(this);

    // add non-emumerable properties
    this.defineOption('route', this.options.route);
    this.define('_callbacks', this._callbacks);
    if (view.stat) {
      utils.defineProp(view, 'history', view.history);
      utils.defineProp(view, '_contents', view._contents);
      utils.defineProp(view, 'stat', view.stat);
    }

    view.path = this.path;
    view.__proto__ = this;

    utils.defineProp(view, '_callbacks', view._callbacks);
    view.options.app.inspect = function () {
      return '<app>';
    };
    view.options.inspect = function () {
      return '<options>';
    };

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
  * Synchronously compile a view.
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
      cb = locals;
      locals = {};
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

    var res = this.locals;
    var data = this.app.cache.data;
    this.ctx('global', data);

    // extend context with same-named data-property from `app.cache.data`
    if (!this.hint('extended')) {
      this.hint('extended', true);
      var name = this.collection.renameKey(this.path);
      this.ctx('matched', data[name]);
    }

    this.ctx('data', this.data);
    this.ctx('options', this.options);

    // build up the array of context keys to calculate
    var keys = ['global', 'compile', 'render', 'options', 'matched'];
    if (this.pickOption('prefer locals') === true) {
      keys = keys.concat(['data', 'locals']);
    } else {
      keys = keys.concat(['locals', 'data']);
    }
    keys = keys.concat(['helper', 'custom']);

    function calculate(obj, contexts, props) {
      var len = props.length, i = -1;
      while (++i < len) {
        var key = props[i];
        extend(obj, contexts[key] || {});
      }
    }

    fn = fn || this.pickOption('context');
    if (typeof fn === 'function') {
      fn.call(this, res, this.contexts, keys, calculate);
    } else {
      calculate(res, this.contexts, keys);
    }

    locals = locals || {};
    extend(res, this.app.mergePartials(locals));
    extend(res, locals);
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
    this.define('_layout', val);
  },
  get: function() {
    if (typeof this._layout !== 'undefined') {
      return this._layout;
    }
    if (typeof this.data.layout !== 'undefined') {
      return this.data.layout;
    }
    if (typeof this.locals.layout !== 'undefined') {
      return this.locals.layout;
    }
    if (typeof this.options.layout !== 'undefined') {
      return this.options.layout;
    }
  }
});

/**
 * Ensure that the `engine` property is set on a view.
 */

Object.defineProperty(View.prototype, 'engine', {
  set: function(val) {
    throw new Error('view.engine is a read-only property and cannot be overwritten.');
  },
  get: function() {
    var engine = this.data.engine
      || this.locals.engine
      || path.extname(this.path);

    // fallback on collection engine
    if (typeof engine === 'undefined') {
      engine = this.pickOption('engine');
    }

    if (engine && engine[0] !== '.') {
      engine = '.' + engine;
    }
    return engine;
  }
});

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
 * Expose `View`
 */

module.exports = View;
