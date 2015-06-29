'use strict';

// require('time-require');

var forOwn = require('for-own');
var router = require('en-route');
var layouts = require('layouts');
var Emitter = require('component-emitter');
var isObject = require('is-object');
var extend = require('extend-shallow');
var Loaders = require('loader-cache');
var inflect = require('pluralize');
var clone = require('clone-deep');
var get = require('get-value');
var set = require('set-value');

var engines = require('./lib/engines');
var loaders = require('./lib/loaders/index');
var helpers = require('./lib/helpers');
var lookup = require('./lib/lookup');
var utils = require('./lib/utils');

var Collection = require('./lib/collection');
var Views = require('./lib/views');
var View = require('./lib/view');
var Item = require('./lib/item');

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
  Emitter.call(this);
  this.init();
}

/**
 * Template methods
 */

Template.prototype = Emitter({
  constructor: Template,

  init: function () {
    this._ = {};
    this.listen();

    engines(this);
    helpers.methods(this);
    lookup(this);

    this.options = {
      layoutDelims: ['{%', '%}'],
      layoutTag: 'body'
    };

    // temporary.
    this.errors = {
      compile: 'Template#compile expects engines to have a compile method',
      render: 'Template#render expects engines to have a render method',
    };

    this.cache = {};
    this.cache.data = {};
    this.cache.context = {};
    this.views = {};
    this.stash = {};

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

    // set internal classes on cache to allow overriding
    this.set('Collection', Collection);
    this.set('Views', Views);
    this.set('View', View);
    this.set('Item', Item);
  },

  /**
   * Listen for events
   */

  listen: function () {
    this.on('error', function (err) {
      console.error('error', err);
    });
  },

  /**
   * Load data onto `app.cache.data`
   */

  data: function(key, val) {
    var args = [].slice.call(arguments);
    var len = args.length;

    if (len === 1 && typeof key === 'string') {
      if (key.indexOf('.') === -1) {
        return this.cache.data[key];
      }
      return get(this.cache.data, key);
    }

    if (isObject(key)) {
      this.visit('data', key);
      return this;
    }

    set(this.cache.data, key, val);
    this.emit('data', key, val);
    return this;
  },

  /**
   * Set or get an option on the instance.
   */

  option: function(key, val) {
    var args = [].slice.call(arguments);
    var len = args.length;

    if (len === 1 && typeof key === 'string') {
      if (key.indexOf('.') === -1) {
        return this.options[key];
      }
      return get(this.options, key);
    }

    if (isObject(key)) {
      this.visit('option', key);
      return this;
    }

    set(this.options, key, val);
    this.emit('option', key, val);
    return this;
  },

  /**
   * Sets a value on the cache.
   *
   * ```js
   * app.set('View', View);
   * ```
   *
   * @param {String} `key` Name of the value to set.
   * @param {*} `val` Value to set.
   * @return {Object} `this` to enable chaining
   * @api public
   */

  set: function (key, val) {
    if (isObject(key)) {
      this.visit('set', key);
      return this;
    }
    set(this.cache, key, val);
    this.emit('cache', key, val);
    return this;
  },

  /**
   * Gets a value from the cache.
   *
   * ```js
   * var View = app.get('View');
   * ```
   *
   * @param {String} `key` Name of the value to get.
   * @return {*} The value from the cache.
   * @api public
   */

  get: function (key) {
    if (key.indexOf('.') === -1) {
      return this.cache[key];
    }
    return get(this.cache, key);
  },

  /**
   * Enable `key`.
   *
   * ```js
   * app.enable('a');
   * ```
   * @param {String} `key`
   * @return {Object} `Options`to enable chaining
   * @api public
   */

  enable: function(key) {
    this.option(key, true);
    return this;
  },

  /**
   * Disable `key`.
   *
   * ```js
   * app.disable('a');
   * ```
   *
   * @param {String} `key` The option to disable.
   * @return {Object} `Options`to enable chaining
   * @api public
   */

  disable: function(key) {
    this.option(key, false);
    return this;
  },

  /**
   * Check if `key` is enabled (truthy).
   *
   * ```js
   * app.enabled('a');
   * //=> false
   *
   * app.enable('a');
   * app.enabled('a');
   * //=> true
   * ```
   *
   * @param {String} `key`
   * @return {Boolean}
   * @api public
   */

  enabled: function(key) {
    return Boolean(this.options[key]);
  },

  /**
   * Check if `key` is disabled (falsey).
   *
   * ```js
   * app.disabled('a');
   * //=> true
   *
   * app.enable('a');
   * app.disabled('a');
   * //=> false
   * ```
   *
   * @param {String} `key`
   * @return {Boolean} Returns true if `key` is disabled.
   * @api public
   */

  disabled: function(key) {
    return !Boolean(this.options[key]);
  },

  /**
   * Lazily initalize `router`, to allow options to
   * be passed in after init.
   */

  lazyLoaders: function() {
    if (typeof this.loaders === 'undefined') {
      this.loaders = new Loaders(this.options);
    }
  },

  /**
   * Format an error
   */

  error: function(id, msg) {
    return new Error(this.errors[id] + msg);
  },

  /**
   * Create a new `Views` collection.
   */

  create: function (single/*, options, loaders*/) {
    var args = utils.slice(arguments, 1);
    var opts = clone(args.shift());
    var plural = this.inflect(single);

    opts.loaderType = opts.loaderType || 'sync';
    opts.collection = plural;
    opts.inflection = single;
    utils.defineProp(opts, 'app', this);

    var Views = this.get('Views');
    var views = new Views(this, args, opts);
    this.viewType(plural, views.viewType());

    views.on('cwd', function (dir) {
      opts.cwd = dir;
    });

    // init the collection object on `views`
    this.views[plural] = views;
    this.loader(plural, opts, args);

    // wrap loaders to expose the collection and opts
    utils.defineProp(opts, 'wrap', views.wrap.bind(views, opts));
    opts.defaultLoader = opts.defaultLoader || 'default';

    // create the actual loader function
    var fn = this.compose(plural, opts);

    // forward collection methods onto loader
    utils.lang.setProto(fn, views);
    views.forward(fn, ['forOwn']);

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
   * Keep a reference to a `view` on the `stash`, for faster lookups.
   *
   * @param  {String} `path` The `view.path` property
   * @param  {String} `key` the view key
   * @param  {String} `collection` Name of the collection, e.g. `pages`
   * @return {Object} Returns the instance, for chaining
   * @api private
   */

  keep: function (path, key, collection) {
    this.stash[path] = {key: key, collection: collection};
    return this;
  },

  /**
   * Set and map the plural name for a view collection.
   *
   * @param  {String} `name`
   * @return {String}
   * @api private
   */

  inflect: function(name) {
    return this.inflections[name] || (this.inflections[name] = inflect(name));
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

  Router: router.Router,

  /**
   * Lazily initalize `router`, to allow options to
   * be passed in after init.
   */

  lazyRouter: function() {
    if (typeof this.router === 'undefined') {
      utils.defineProp(this, 'router', new this.Router({
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
        if (views.hasOwnProperty(key)) {
          stack[key] = views[key];
        }
      }
    }

    // get the name of the first layout
    var name = view.layout;
    var str = view.content;

    // apply the layout
    var res = layouts(str, name, stack, opts);
    view.option('stack', res.stack);
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
    var engine = this.engine(view.getEngine(locals));
    if (!engine || !engine.hasOwnProperty('compile')) {
      throw this.error('compile', engine);
    }

    view.ctx('compile', locals);

    // build the context to pass to the engine
    var ctx = view.context(locals);

    // apply layout
    view = this.applyLayout(view, ctx);

    // Bind context to helpers before passing to the engine.
    this.bindHelpers(locals, ctx, (locals.async = isAsync));

    // handle `preCompile` middleware
    this.handleView('preCompile', view, locals);

    // compile the string
    view.fn = engine.compile(view.content, locals);

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

    view.ctx('render', locals);

    // handle `preRender` middleware
    this.handleView('preRender', view, locals);

    // build the context for the view
    var ctx = view.context(locals);

    // get the engine
    var engine = this.engine(view.getEngine(ctx));
    if (!engine || !engine.hasOwnProperty('render')) {
      throw this.error('render', engine);
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

    // render the view
    return engine.render(view.fn, ctx, function (err, res) {
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

      forOwn(collection, function (view, key) {
        // handle `onMerge` middleware
        this.handleView('onMerge', view, locals);

        if (view.options.nomerge) return;
        if (opts.mergePartials === true) {
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

  context: function (view, locals) {
    var ctx = {};

    // add partials to the context to pass to engines
    extend(ctx, this.mergePartials(locals));
    // Merge in `locals/data` from views
    // extend(ctx, this.cache.context.partials);

    extend(ctx, this.cache.data);
    extend(ctx, view.omit([view.protoKeys(), 'locals']));
    extend(ctx, view.context(locals));
    return ctx;
  },

  /**
   * Build the context for the given `view` and `locals`.
   */

  bindHelpers: function (locals, context, isAsync) {
    var helpers = {};
    extend(helpers, this.options.helpers);
    extend(helpers, this._.helpers.sync);

    if (isAsync) extend(helpers, this._.helpers.async);
    extend(helpers, locals.helpers);

    // build the context to expose as `this` in helpers
    var thisArg = {};
    thisArg.options = extend({}, this.options.helper, locals);
    thisArg.context = context || {};
    thisArg.app = this;

    locals.helpers = utils.object.bindAll(helpers, thisArg);
  },

  /**
   * Delegate loader methods
   */

  delegateLoaders: function (methods) {
    this.lazyLoaders();
    var loaders = this.loaders, self = this;
    utils.arrayify(methods).forEach(function (method) {
      utils.defineProp(self, method, function() {
        return loaders[method].apply(loaders, arguments);
      });
    });
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
      utils.defineProp(this, method, function(path) {
        var route = this.router.route(path);
        var args = [].slice.call(arguments, 1);
        route[method].apply(route, args);
        return this;
      }.bind(this));
    }.bind(this));
  },

  /**
   * Call the given method on each value in `obj`.
   */

  visit: function (method, obj) {
    utils.visit(this, method, obj);
    return this;
  },

  /**
   * Add a method to the Template prototype
   */

  mixin: function (name, fn) {
    Template.prototype[name] = fn;
  },

  /**
   * Build a tree of all property names on the given object and
   * its ancestor objects.
   */

  showKeys: function (obj) {
    return utils.lang.protoTree(obj);
  },

  /**
   * Show the `ownPropertyNames` on the given object or the instance.
   */

  debug: function (obj) {
    return utils.makeEnumerable(obj || this);
  }
});

/**
 * Expose `Template`
 */

module.exports = Template;
