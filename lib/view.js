'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('extend-shallow', 'extend');
lazy('relative', 'relative');
lazy('rewrite-ext', 'rewrite');
lazy('detect-conflicts', 'detect');
lazy('assign-value', 'assign');
lazy('clone-deep', 'clone');
lazy('object.omit', 'omit');
lazy('copy');
lazy('write');

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
  this.history = [];
  Item.call(this, view, options);
  this.init(view);
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

  init: function (view) {
    view.base = view.base || view.cwd || process.cwd();
    this.src = this.src || {};
    // ensure that `view` has `path` and `content` properties
    this.validate(view);

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

    view.__proto__ = this;
    utils.defineProp(view, '_callbacks', view._callbacks);

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
    var opts = lazy.clone(this.options);
    var res = {};

    lazy.omit(this, keys, function (val, key) {
      res[key] = lazy.clone(val);
    });
    return new Parent(res, opts);
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
    lazy.assign(this.contexts, name, obj);
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
        lazy.extend(obj, contexts[key] || {});
      }
    }

    fn = fn || this.pickOption('context');
    if (typeof fn === 'function') {
      fn.call(this, res, this.contexts, keys, calculate);
    } else {
      calculate(res, this.contexts, keys);
    }

    locals = locals || {};
    lazy.extend(res, this.app.mergePartials(locals));
    lazy.extend(res, locals);
    return res;
  },

  read: function (fp) {
    if (this.contents) return this;
    fp = path.resolve(this.cwd, fp || this.path);
    this.contents = fs.readFileSync(fp);
    return this;
  },

  /**
   * Write the item to disk asynchronously.
   *
   * @param {String} `fp` Destination filepath.
   * @param {Function} `cb` Callback function
   * @returns {Object} Returns the instance for chaining.
   * @api public
   */

  write: function (fp, cb) {
    if (typeof fp === 'function') {
      cb = fp;
      fp = null;
    }

    if (typeof cb !== 'function') {
      throw new Error('async `write` was called without a callback function.');
    }

    var dest = fp || this.dest.path;
    var src = this.src.path;
    var str = this.content;
    var opts = this.options || {};
    if (typeof opts.force !== 'boolean') {
      opts.force = true;
    }

    lazy.detect(this, opts, function () {
      if (str) {
        lazy.write(dest, str, cb);
      } else {
        lazy.copy(src, dest, cb);
      }
    });

    this.emit('write', dest);
    return this;
  },

  /**
   * Validate a view.
   */

  validate: function (view) {
    if (typeof view.path === 'undefined') {
      utils.error('View#validate `path` is a required field: ', view);
    }
  }
});

/**
 * Expose `extend`, to allow other classes to inherit
 * from the `View` class.
 *
 * ```js
 * function MyCustomView(options) {...}
 * View.lazy.extend(MyCustomView);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `View`
 * @return {undefined}
 * @api public
 */

View.extend = function (Ctor) {
  util.inherits(Ctor, View);
  lazy.extend(Ctor, View);
};

function mixin(key, val) {
  Object.defineProperty(View.prototype, key, val);
}

/**
 * Ensure that the `layout` property is set on a view.
 */

mixin('content', {
  set: function(content) {
    utils.defineProp(this, '_content', content);
  },
  get: function() {
    if (this._content) {
      return this._content;
    }

    if (Buffer.isBuffer(this.contents)) {
      return this.contents.toString();
    }
    if (typeof this.path === 'string') {
      this.read();
      return this.content;
    }
  }
});

/**
 * Ensure that the `layout` property is set on a view.
 */

mixin('layout', {
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

mixin('engine', {
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

mixin('path', {
  get: function() {
    return this.history[this.history.length - 1];
  },
  set: function(fp) {
    if (typeof fp !== 'string') {
      throw new Error('`view.path` must be a string.');
    }
    if (fp && fp !== this.path) {
      this.history.push(fp);
    }
  }
});

mixin('name', {
  get: function() {
    return this._name;
  },
  set: function(name) {
    if (name && typeof name !== 'string') {
      throw new Error('`view.name` must be a string.');
    }
    name = name || path.basename(this.path, path.extname(this.path));
    utils.defineProp(this, '_name', name);
  }
});

mixin('cwd', {
  get: function() {
    return path.resolve(this._cwd || process.cwd());
  },
  set: function(cwd) {
    utils.defineProp(this, '_cwd', cwd || process.cwd());
  }
});

mixin('relative', {
  get: function() {
    if (!this.base) {
      throw new Error('`view.base` must be defined to get relative path.');
    }
    if (!this.path) {
      throw new Error('`view.path` must be defined to get relative path.');
    }
    return lazy.relative(this.base, this.path);
  },
  set: function() {
    throw new Error('file.relative is read-only and cannot be overridden.');
  }
});

mixin('absolute', {
  get: function() {
    if (!this.path) {
      throw new Error('`view.path` must be defined to get absolute path.');
    }
    return path.resolve(this.base, this.path);
  },
  set: function() {
    throw new Error('file.absolute is read-only and cannot be overridden.');
  }
});

mixin('dirname', {
  get: function() {
    if (!this.path) {
      throw new Error('`view.path` must be defined to get dirname.');
    }
    return path.dirname(this.path);
  },
  set: function(dirname) {
    if (!this.path) {
      throw new Error('`view.path` must be defined to set dirname.');
    }
    this.path = path.join(dirname, path.basename(this.path));
  }
});

mixin('basename', {
  get: function() {
    if (!this.path) {
      throw new Error('`view.path` must be defined to get basename.');
    }
    return path.basename(this.path);
  },
  set: function(basename) {
    if (!this.path) {
      throw new Error('`view.path` must be defined to set basename.');
    }
    this.path = path.join(path.dirname(this.path), basename);
  }
});

mixin('extname', {
  get: function() {
    if (!this.path) {
      throw new Error('`view.path` must be defined to get extname.');
    }
    return path.extname(this.path);
  },
  set: function(extname) {
    if (!this.path) {
      throw new Error('`view.path` must be defined to set extname.');
    }
    var ext = extname || this._extname || (this._extname = path.extname(this.path));
    this.path = lazy.rewrite(this.path, ext);
  }
});

/**
 * Expose `View`
 */

module.exports = View;
