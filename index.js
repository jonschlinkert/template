'use strict';

// require('time-require');

var path = require('path');
var util = require('util');
var typeOf = require('kind-of');
var isObject = require('isobject');
var isGlob = require('is-glob');
var mixin = require('mixin-object');
var extend = require('extend-shallow');

/**
 * Lazily required dependencies
 */

var lazy = require('lazy-cache')(require);
var LoaderCache = lazy('loader-cache');
var inflect = lazy('inflection');
var clone = lazy('clone-deep');
var visit = lazy('object-visit');
var mapVisit = lazy('map-visit');
var forOwn = lazy('for-own');
var router = lazy('en-route');
var layouts = lazy('layouts');
var get = lazy('get-value');
var set = lazy('set-value');

/**
 * Local modules
 */

var Base = require('./lib/base');
var Collection = require('./lib/collection');
var engines = require('./lib/engines');
var loaders = require('./lib/loaders/index');
var helpers = require('./lib/helpers');
var lookup = require('./lib/lookup');
var utils = require('./lib/utils');
var viewFactory = require('./lib/factory/view');
var fileFactory = require('./lib/factory/file');

/**
 * Create a new instance of `Template` with the given `options.
 *
 * @param {Object} `options`
 * @api public
 */

function Template(options) {
  if (!(this instanceof Template)) {
    return new Template(options);
  }
  this.options = options || {};
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

    this.define('Item', require('./lib/item'));
    this.define('View', require('./lib/view'));
    this.define('List', require('./lib/list'));
    this.define('Views', require('./lib/views'));
    this.define('Collection', require('./lib/collection'));

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
    loaders.first(this);
    loaders.data(this);
  },

  /**
   * Listen for events
   */

  listen: function () {
    this.on('error', function (msg, err) {
      console.error(msg, err);
    });

    this.on('option', function (key, value) {
      if (key === 'mixins') this.visit('mixin', value);
    });
  },

  /**
   * Fallback on default settings if the given property
   * is not defined or doesn't match the given `type` of value.
   */

  defaults: function (prop, value, type) {
    var val = get(this.options, prop);
    if ((!type && typeOf(val) === 'undefined') || typeOf(val) !== type) {
      set(this.options, prop, value);
    }
    return this;
  },

  /**
   * Load data onto `app.cache.data`
   */

  data: function(key, val, escape) {
    if (arguments.length === 1) {
      var type = typeOf(key);
      if (type === 'string') {
        if (key.indexOf('.') === -1) {
          return this.cache.data[key];
        }
        if (isGlob(key)) {
          this.compose('data')(key, val);
          return this;
        }
        return get()(this.cache.data, key);
      }
      if (type === 'object') {
        this.visit('data', key);
        return this;
      }
    }
    set()(this.cache.data, key, val);
    this.emit('data', key, val);
    return this;
  },

  /**
   * Lazily initalize `router`, to allow options to
   * be passed in after init.
   */

  lazyLoaders: function() {
    if (!Object.keys(this.loaders).length) {
      this.loaders = (new LoaderCache())(this.options);
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
   * @param  {String} name The name of the collection. Plural or singular form.
   * @param  {Object} opts Collection options
   * @param  {String|Array|Function} loaders Loaders to use for adding views to the collection.
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  create: function (name, opts, loaders) {
    var args = utils.slice(arguments, 1);
    opts = clone()(args.shift());
    loaders = args;

    var single = inflect().singularize(name);
    var plural = inflect().pluralize(name);
    this.inflections[single] = plural;

    if (typeof opts.renameKey === 'undefined' && this.options.renameKey) {
      opts.renameKey = this.options.renameKey;
    }

    opts.plural = plural;
    opts.inflection = single;
    opts.loaders = loaders;
    opts.app = this;
    opts = extend({}, opts, this.options);

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
   * @api private
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

  Router: router().Router,

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
   * @param {String} `path`
   * @param {Function} `callback`
   * @return {Object} `this` for chaining
   * @api public
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
   * @param {String} `name`
   * @param {Function} `fn`
   * @return {Object} `this` for chaining
   * @api public
   */

  param: function(/*name, fn*/) {
    this.lazyRouter();
    this.router.param.apply(this.router, arguments);
    return this;
  },

  /**
   * Apply a layout to the given `view`.
   *
   * @param  {Object} `view`
   * @param  {Object} `locals`
   * @return {Object}
   */

  applyLayout: function(view) {
    if (view.options.layoutApplied) {
      return view;
    }

    // handle pre-layout middleware
    this.handle('preLayout', view);

    var opts = {};
    extend(opts, this.options);
    extend(opts, view.options);
    extend(opts, view.context());

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

    // apply the layout
    var res = layouts()(str, name, stack, opts, function (layoutObj) {
      // get the layout that is currently being applied to the view
      view.currentLayout = layoutObj.layout;
      self.handle('onLayout', view);
      delete view.currentLayout;
    });

    view.option('layoutStack', res.history);
    view.option('layoutApplied', true);
    view.content = res.result;

    // handle post-layout middleware
    this.handle('postLayout', view);
    return view;
  },

  /**
   * Compile a view.
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
    var settings = extend({}, ctx, locals);

    // compile the string
    view.fn = engine.compile(view.content, settings);
    // handle `postCompile` middleware
    this.handleView('postCompile', view, locals);
    return view;
  },

  /**
   * Render a view.
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
   */

  mergePartials: function (locals, keys) {
    var names = keys || this.viewTypes.partial;
    var opts = extend({}, this.options, locals);

    return names.reduce(function (acc, name) {
      var collection = this.views[name];

      forOwn()(collection, function (view, key) {
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
   * @param  {Object} `view` Template object
   * @param  {Object} `locals`
   * @return {Object} The object to be passed to engines/views as context.
   */

  context: function (view, ctx, locals) {
    var obj = {};
    mixin(obj, ctx);
    mixin(obj, this.cache.data);
    mixin(obj, view.data);
    mixin(obj, view.locals);
    mixin(obj, locals);
    return obj;
  },

  /**
   * Build the context for the given `view` and `locals`.
   */

  bindHelpers: function (view, locals, context, isAsync) {
    var helpers = {};
    extend(helpers, this.options.helpers);
    extend(helpers, this._.helpers.sync);

    if (isAsync) extend(helpers, this._.helpers.async);
    extend(helpers, locals.helpers);

    // build the context to expose as `this` in helpers
    var thisArg = {};
    thisArg.options = extend({}, this.options.helper, locals);
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
   * Show the properties on the given object or the instance.
   */

  debug: function (obj) {
    return utils.makeEnumerable(obj || this);
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
   * @return {Object} Returns the instance of `Template`, for chaining.
   * @api public
   */

  define: function (key, value) {
    utils.defineProp(this, key, value);
    return this;
  },

  /**
   * Call the given method on each value in `obj`.
   */

  visit: function (method, obj) {
    visit()(this, method, obj);
    return this;
  },

  /**
   * Call the given method on each value in `obj`.
   */

  mapVisit: function (method, arr) {
    mapVisit()(this, method, arr);
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
 * Item.extend(MyCustomItem);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `Item`
 * @return {undefined}
 * @api public
 */

Template.extend = function(Ctor) {
  util.inherits(Ctor, Template);
};

/**
 * Expose `Template`
 */

module.exports = Template;
