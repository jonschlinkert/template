'use strict';

var path = require('path');
var util = require('util');
var omit = require('object.omit');
var extend = require('extend-shallow');
var assign = require('assign-value');
var forOwn = require('for-own');
var clone = require('clone-deep');
var mixins = require('./mixins/view');
var utils = require('./utils');
var Item = require('./item');

/**
 * Create an instance of `View`.
 */

function View(view, options) {
  Item.call(this, options);
  this.init(view);
  mixins(this);
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

    this.options.plural = this.collection.options.plural;
    this.options.orig = view.content;
    this.options.viewType = this.options.viewType = [];
    this.options.handled = this.options.handled = [];

    this.contexts = view.contexts = {};
    this.locals = view.locals || {};
    this.data = view.data || {};
    this.dest = view.dest || {};

    this.src = view.src || {};
    this.src.path = this.src.path || this.path;

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
    var Constructor = this.constructor;
    var opts = this.options;
    var view = omit(this, keys);
    var res = {};

    forOwn(view, function (val, key) {
      if (typeof val !== 'function') {
        res[key] = clone(val);
      }
    });
    return new Constructor(res, opts);
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
    assign(this.contexts, name, obj);
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

Object.defineProperty(View.prototype, 'layout', {
  set: function(val) {
    utils.defineProp(this, '_layout', val);
  },
  get: function() {
    return this._layout || this.data.layout || this.locals.layout || this.options.layout;
  }
});

// Object.defineProperty(View.prototype, 'zzz', {
//   get: function() {
//     return this._zzz || this.app.zzz;
//   },
//   set: function(val) {
//     utils.defineProp(this, '_zzz', val);
//   }
// });

/**
 * Expose `View`
 */

module.exports = View;
