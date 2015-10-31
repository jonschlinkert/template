'use strict';

var path = require('path');
var util = require('util');
var lazy = require('lazy-cache')(require);

/**
 * Lazily required dependencies
 */

lazy('is-glob', 'isGlob');
lazy('mixin-object', 'mixin');
lazy('extend-shallow', 'extend');
lazy('loader-cache', 'LoaderCache');
lazy('inflection', 'inflect');
lazy('clone-deep', 'clone');
lazy('collection-visit', 'visit');
lazy('for-own', 'forOwn');
lazy('en-route', 'router');
lazy('get-value', 'get');
lazy('set-value', 'set');
lazy('layouts');

/**
 * Local modules
 */

var viewFactory = require('./lib/factory/view');
var engines = require('./lib/engines');
var loaders = require('./lib/loaders');
var helpers = require('./lib/helpers');
var lookup = require('./lib/lookup');
var utils = require('./lib/utils');
var Base = require('./lib/base');

/**
 * Create a new instance of `Template` with the given `options.
 *
 * ```js
 * var app = require('template')();
 * ```
 *
 * @param {Object} `options`
 * @api public
 */

function Template(options) {
  if (!(this instanceof Template)) {
    return new Template(options);
  }
  Base.call(this, options);
  this.init();
}

/**
 * Inherit `Base`
 */

Base.extend(Template);

/**
 * `Template` prototype methods
 */

utils.delegate(Template.prototype, {
  constructor: Template,

  /**
   * Initialize defaults
   */

  init: function () {
    this._ = {};
    this.listen();

    engines(this);
    helpers.methods(this);
    lookup(this);

    // temporary.
    this.define('errors', {
      compile: {
        engine: 'cannot find an engine for: ',
        method: 'expects engines to have a compile method',
      },
      render: {
        callback: 'is async and expects a callback function: ',
        engine: 'cannot find an engine for: ',
        method: 'expects engines to have a render method',
      }
    });

    this.loaders = {};
    this.cache = {};
    this.cache.data = {};

    this.cache.context = {};
    this.views = {};

    this.define('Base', require('./lib/base'));
    this.define('Collection', require('./lib/collection'));
    this.define('Item', require('./lib/item'));
    this.define('List', require('./lib/list'));
    this.define('View', require('./lib/view'));
    this.define('Views', require('./lib/views'));

    this.viewTypes = {
      layout: [],
      renderable: [],
      partial: []
    };

    this.inflections = {};
    this.handlers(utils.methods);
    this.delegateLoaders([
      'loader',
      'resolve',
      'compose',
      'iterator',
    ]);

    // initialize iterators and loaders
    loaders.iterators(this);
    loaders.base(this);
    loaders.data(this);
  },

  /**
   * Listen for events
   */

  listen: function () {
    this.on('option', function (key, value) {
      if (key === 'mixins') {
        this.visit('mixin', value);
      }
    });
  },

  /**
   * Load data onto `app.cache.data`
   *
   * ```js
   * console.log(app.cache.data);
   * //=> {};
   *
   * app.data('a', 'b');
   * app.data({c: 'd'});
   * console.log(app.cache.data);
   * //=> {a: 'b', c: 'd'}
   * ```
   * @name .data
   * @param {String|Object} `key` Key of the value to set, or object to extend.
   * @param {any} `val`
   * @return {Object} Returns the instance of `Template` for chaining
   * @api public
   */

  data: function(key, val) {
    if (arguments.length === 1) {
      if (typeof key === 'string') {
        if (key.indexOf('.') === -1) {
          return this.cache.data[key];
        }
        if (lazy.isGlob(key)) {
          this.compose('data')(key, val);
          return this;
        }
        return lazy.get(this.cache.data, key);
      }
    }

    if (typeof key === 'object') {
      var args = [].slice.call(arguments);
      key = [].concat.apply([], args);
      this.visit('data', key);
      return this;
    }

    lazy.set(this.cache.data, key, val);
    this.emit('data', key, val);
    return this;
  },

  /**
   * Lazily initalize `router`, to allow options to
   * be passed in after init.
   */

  lazyLoaders: function() {
    if (!Object.keys(this.loaders).length) {
      this.loaders = new lazy.LoaderCache(this.options);
    }
  },

  /**
   * Delegate loader methods
   */

  delegateLoaders: function (methods) {
    this.lazyLoaders();
    var loaders = this.loaders;
    var self = this;

    utils.arrayify(methods).forEach(function (method) {
      self.define(method, function() {
        return loaders[method].apply(loaders, arguments);
      });
    });
  },

  /**
   * Create a new `Views` collection.
   *
   * ```js
   * app.create('foo');
   * app.foo('*.hbs');
   * var view = app.foo.get('baz.hbs');
   * ```
   *
   * @name .create
   * @param  {String} `name` The name of the collection. Plural or singular form.
   * @param  {Object} `opts` Collection options
   * @param  {String|Array|Function} `loaders` Loaders to use for adding views to the created collection.
   * @return {Object} Returns the `Assemble` instance for chaining.
   * @api public
   */

  create: function (name, opts, loaders) {
    var args = utils.slice(arguments, 1);
    opts = lazy.clone(args.shift());
    loaders = args;

    var single = lazy.inflect.singularize(name);
    var plural = lazy.inflect.pluralize(name);
    this.inflections[single] = plural;

    if (typeof opts.renameKey === 'undefined' && this.options.renameKey) {
      opts.renameKey = this.options.renameKey;
    }

    opts.plural = plural;
    opts.inflection = single;
    opts.loaders = loaders;
    opts.app = this;
    opts = lazy.extend({}, opts, this.options);

    if (!opts.loaderType) {
      opts.loaderType = 'sync';
    }

    var Views = this.get('Views');
    var views = new Views(opts);
    this.viewType(plural, views.viewType());

    // add custom View constructor for collection items
    var ViewClass = viewFactory(single, opts);
    var classKey = single[0].toUpperCase() + single.slice(1);
    this.define(classKey, ViewClass);

    // init the collection object on `views`
    this.views[plural] = views;
    this.loader(plural, opts, loaders);

    // wrap loaders to expose the collection and opts
    utils.defineProp(opts, 'wrap', views.wrap.bind(views, opts));
    opts.defaultLoader = opts.defaultLoader || 'default';

    // create the actual loader function
    var fn = this.compose(plural, opts);
    views.forward(fn, ['forOwn']);

    // forward collection methods onto loader
    utils.setProto(fn, views);

    // add loader methods to the instance: `app.pages()`
    this.mixin(single, fn);
    this.mixin(plural, fn);

    // decorate named loader methods back to the collection
    // to allow chaining like `.pages().pages()` etc
    utils.defineProp(views, plural, fn);
    utils.defineProp(views, single, fn);

    // add collection and view (item) helpers
    helpers.collection(this, views, opts);
    helpers.view(this, views, opts);
    return this;
  },

  /**
   * Set view types for a collection.
   *
   * @param {String} `plural` e.g. `pages`
   * @param {Object} `options`
   */

  viewType: function(plural, types) {
    var len = types.length, i = 0;
    while (len--) {
      var type = types[i++];
      this.viewTypes[type] = this.viewTypes[type] || [];
      if (this.viewTypes[type].indexOf(plural) === -1) {
        this.viewTypes[type].push(plural);
      }
    }
    return types;
  },

  /**
   * Add `Router` to the prototype
   */

  Router: lazy.router.Router,

  /**
   * Lazily initalize `router`, to allow options to
   * be passed in after init.
   */

  lazyRouter: function() {
    if (typeof this.router === 'undefined') {
      this.define('router', new this.Router({
        methods: utils.methods
      }));
    }
  },

  /**
   * Handle middleware for the given `view` and locals.
   *
   * ```js
   * app.handle('customHandle', view);
   * ```
   *
   * @name .handle
   * @param {String} `method` Router VERB
   * @param {Object} `view` View object
   * @param {Object} `locals`
   * @param {Function} `cb`
   * @return {Object}
   * @api public
   */

  handle: function (method, view, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    this.lazyRouter();
    view.options = view.options || {};
    view.options.handled = view.options.handled || [];

    if (typeof cb !== 'function') {
      cb = this.handleError(method, view);
    }

    view.options.method = method;
    view.options.handled.push(method);
    if (view.emit) {
      view.emit('handle', method);
    }

    this.router.handle(view, function (err) {
      if (err) return cb(err);
      cb(null, view);
    });
  },

  /**
   * Run the given handler only if the view has not
   * already been handled by the method
   *
   * @name .handleView
   * @param  {Object} `collection` Collection name
   * @param  {Object} `locals`
   * @return {Array} Returns an array of view objects with rendered content.
   */

  handleView: function (method, view, locals/*, cb*/) {
    if (view.options.handled.indexOf(method) === -1) {
      this.handle.apply(this, arguments);
    }
    this.emit(method, view, locals);
  },

  /**
   * Handle middleware errors.
   */

  handleError: function(method, view) {
    return function (err) {
      if (err) {
        err.reason = 'Template#handle' + method + ': ' + view.path;
        return err;
      }
    };
  },

  /**
   * Special-cased "all" method, applying the given route `path`,
   * middleware, and callback.
   *
   * @name .all
   * @param {String} `path`
   * @param {Function} `callback`
   * @return {Object} `this` for chaining
   */

  all: function(path/*, callback*/) {
    this.lazyRouter();
    var route = this.router.route(path);
    route.all.apply(route, [].slice.call(arguments, 1));
    return this;
  },

  /**
   * Proxy to `Router#param`
   *
   * @name .param
   * @param {String} `name`
   * @param {Function} `fn`
   * @return {Object} Returns the instance of `Template` for chaining.
   */

  param: function(/*name, fn*/) {
    this.lazyRouter();
    this.router.param.apply(this.router, arguments);
    return this;
  },

  /**
   * Apply a layout to the given `view`.
   *
   * @name .applyLayout
   * @param  {Object} `view`
   * @return {Object} Returns a `view` object.
   */

  applyLayout: function(view) {
    if (view.options.layoutApplied) {
      return view;
    }

    // handle pre-layout middleware
    this.handle('preLayout', view);

    var opts = {};
    lazy.extend(opts, this.options);
    lazy.extend(opts, view.options);
    lazy.extend(opts, view.context());

    // get the layout stack
    var stack = {};
    var alias = this.viewTypes.layout;
    var len = alias.length, i = 0;

    while (len--) {
      var views = this.views[alias[i++]];
      for (var key in views) {
        var val = views[key];
        if (views.hasOwnProperty(key) && typeof val !== 'function' && val.path) {
          stack[key] = val;
        }
      }
    }

    // get the name of the first layout
    var name = view.layout;
    var str = view.content;
    var self = this;

    if (!name) return view;

    // Handle each layout before it's applied to a view
    function handleLayout(layoutObj) {
      view.currentLayout = layoutObj.layout;
      self.handle('onLayout', view);
      delete view.currentLayout;
    }

    // actually apply the layout
    var res = lazy.layouts(str, name, stack, opts, handleLayout);

    view.option('layoutStack', res.history);
    view.option('layoutApplied', true);
    view.content = res.result;

    // handle post-layout middleware
    this.handle('postLayout', view);
    return view;
  },

  /**
   * Compile `content` with the given `locals`.
   *
   * ```js
   * var blogPost = app.post('2015-09-01-foo-bar');
   * var view = app.compile(blogPost);
   * // view.fn => [function]
   * ```
   *
   * @name .compile
   * @param  {Object|String} `view` View object.
   * @param  {Object} `locals`
   * @param  {Boolean} `isAsync` Load async helpers
   * @return {Object} View object with `fn` property with the compiled function.
   * @api public
   */

  compile: function(view, locals, isAsync) {
    if (typeof locals === 'boolean') {
      isAsync = locals;
      locals = {};
    }

    // get the engine to use
    locals = locals || {};
    var engine = this.engine(locals.engine ? locals.engine : view.engine);

    if (typeof engine === 'undefined') {
      throw this.error('compile', 'engine', view);
    }
    if (!engine.hasOwnProperty('compile')) {
      throw this.error('compile', 'method', engine);
    }

    view.ctx('compile', locals);
    // build the context to pass to the engine
    var ctx = view.context(locals);
    // apply layout
    view = this.applyLayout(view, ctx);
    // handle `preCompile` middleware
    this.handleView('preCompile', view, locals);

    // Bind context to helpers before passing to the engine.
    this.bindHelpers(view, locals, ctx, (locals.async = isAsync));
    var settings = lazy.extend({}, ctx, locals);

    // compile the string
    view.fn = engine.compile(view.content, settings);
    // handle `postCompile` middleware
    this.handleView('postCompile', view, locals);
    return view;
  },

  /**
   * Render `content` with the given `locals` and `callback`.
   *
   * ```js
   * var blogPost = app.post('2015-09-01-foo-bar');
   * app.render(blogPost, function(err, view) {
   *   // `view` is an object with a rendered `content` property
   * });
   * ```
   *
   * @name .render
   * @param  {Object|String} `file` String or normalized template object.
   * @param  {Object} `locals` Locals to pass to registered view engines.
   * @param  {Function} `callback`
   * @api public
   */

  render: function (view, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    // if `view` is a function, it's probably from chaining
    // a collection method
    if (typeof view === 'function') {
      return view.call(this);
    }

    // if `view` is a string, see if it's a cache view
    if (typeof view === 'string') {
      view = this.lookup(view);
    }

    locals = locals || {};

    // add `locals` to `view.contexts`
    view.ctx('render', locals);
    var data = this.cache.data;
    for (var key in locals) {
      if (locals.hasOwnProperty(key) && !data.hasOwnProperty(key)) {
        data[key] = locals[key];
      }
    }

    // handle `preRender` middleware
    this.handleView('preRender', view, locals);

    // build the context for the view
    var ctx = this.context(locals);

    // get the engine
    var engine = this.engine(locals.engine ? locals.engine : view.engine);

    if (typeof cb !== 'function') {
      throw this.error('render', 'callback');
    }
    if (typeof engine === 'undefined') {
      throw this.error('render', 'engine', path.extname(view.path));
    }
    if (!engine.hasOwnProperty('render')) {
      throw this.error('render', 'method', JSON.stringify(view));
    }

    // if it's not already compiled, do that first
    if (typeof view.fn !== 'function') {
      try {
        var isAsync = typeof cb === 'function';
        view = this.compile(view, locals, isAsync);
        return this.render(view, locals, cb);
      } catch (err) {
        this.emit('error', err);
        return cb.call(this, err);
      }
    }

    var context = this.context(view, ctx, locals);

    // render the view
    return engine.render(view.fn, context, function (err, res) {
      if (err) {
        this.emit('error', err);
        return cb.call(this, err);
      }
      // handle `postRender` middleware
      view.content = res;
      this.handle('postRender', view, locals, cb);
    }.bind(this));
  },

  /**
   * Merge "partials" view types. This is necessary for template
   * engines that only support one class of partials.
   *
   * @name .mergePartials
   * @param {Object} `locals`
   * @param {Array} `viewTypes` Optionally pass an array of viewTypes to include.
   * @return {Object} Merged partials
   */

  mergePartials: function (locals, viewTypes) {
    var names = viewTypes || this.viewTypes.partial;
    var opts = lazy.extend({}, this.options, locals);

    return names.reduce(function (acc, name) {
      var collection = this.views[name];

      lazy.forOwn(collection, function (view, key) {
        // handle `onMerge` middleware
        this.handleView('onMerge', view, locals);

        if (view.options.nomerge) return;
        if (opts.mergePartials !== false) {
          name = 'partials';
        }
        acc[name] = acc[name] || {};
        acc[name][key] = view.content;
      }, this);
      return acc;
    }.bind(this), {});
  },

  /**
   * Build the context for the given `view` and `locals`.
   * This can be overridden by passing a function to the
   * `mergeContext` option.
   *
   * @name .context
   * @param  {Object} `view` Template object
   * @param  {Object} `locals`
   * @return {Object} The object to be passed to engines/views as context.
   */

  context: function (view, ctx, locals) {
    var obj = {};
    lazy.mixin(obj, ctx);
    lazy.mixin(obj, this.cache.data);
    lazy.mixin(obj, view.data);
    lazy.mixin(obj, view.locals);
    lazy.mixin(obj, locals);
    return obj;
  },

  /**
   * Build the context for the given `view` and `locals`.
   */

  bindHelpers: function (view, locals, context, isAsync) {
    var helpers = {};
    lazy.extend(helpers, this.options.helpers);
    lazy.extend(helpers, this._.helpers.sync);

    if (isAsync) lazy.extend(helpers, this._.helpers.async);
    lazy.extend(helpers, locals.helpers);

    // build the context to expose as `this` in helpers
    var thisArg = {};
    thisArg.options = lazy.extend({}, this.options, locals);
    thisArg.context = context || {};
    thisArg.context.view = view;
    thisArg.app = this;

    // bind template helpers to the instance
    locals.helpers = utils.bindAll(helpers, thisArg);
  },

  /**
   * Add a router handler.
   *
   * @param  {String} `method` Method name.
   */

  handler: function (methods) {
    this.handlers(methods);
  },

  /**
   * Add default Router handlers to Template.
   */

  handlers: function (methods) {
    this.lazyRouter();
    this.router.method(methods);
    utils.arrayify(methods).forEach(function (method) {
      this.define(method, function(path) {
        var route = this.router.route(path);
        var args = [].slice.call(arguments, 1);
        route[method].apply(route, args);
        return this;
      }.bind(this));
    }.bind(this));
  },

  /**
   * Format an error
   */

  error: function(method, id, msg) {
    return new Error(this.errors[method][id] + 'Template#' + method + ' ' + msg);
  },

  /**
   * Add a method to the Template prototype
   */

  mixin: function (name, fn) {
    Template.prototype[name] = fn;
  },

  /**
   * Define a non-enumerable property on the instance.
   *
   * @param  {String} key The property name.
   * @param  {any} value Property value.
   * @return {Object} Returns the instance of `Template` for chaining.
   */

  define: function (key, value) {
    utils.defineProp(this, key, value);
    return this;
  },

  /**
   * Call the given method on each value in `obj`.
   */

  visit: function (method, obj) {
    lazy.visit(this, method, obj);
    return this;
  }
});

/**
 *
 * Expose `extend`, static method for allowing other classes to inherit
 * from the `Item` class (and receive all of Item's prototype methods).
 *
 * ```js
 * function MyCustomItem(options) {...}
 * Item.lazy.extend(MyCustomItem);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `Item`
 * @return {undefined}
 */

Template.extend = function(Ctor) {
  util.inherits(Ctor, Template);
  lazy.extend(Ctor, Template);
};

/**
 * Expose `Template`
 */

module.exports = Template;
