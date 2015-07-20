'use strict';

// require('time-require');

var path = require('path');
var typeOf = require('kind-of');
var forOwn = require('for-own');
var router = require('en-route');
var visit = require('object-visit');
var layouts = require('layouts');
var Emitter = require('component-emitter');
var isObject = require('isobject');
var isGlob = require('is-glob');
var mixin = require('mixin-object');
var extend = require('extend-shallow');
var Loaders = require('loader-cache');
var inflect = require('inflection');
var clone = require('clone-deep');
var get = require('get-value');
var set = require('set-value');

var Collection = require('./lib/collection');
var engines = require('./lib/engines');
var loaders = require('./lib/loaders/index');
var helpers = require('./lib/helpers');
var lookup = require('./lib/lookup');
var utils = require('./lib/utils');

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
  this.options = options || {};
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

    this.options.layoutDelims = ['{%', '%}'];
    this.options.layoutTag = 'body';

    // temporary.
    this.errors = {
      compile: 'Template#compile expects engines to have a compile method',
      engine: 'Template#render cannot find an engine for: ',
      render: 'Template#render expects engines to have a render method',
    };

    this.cache = {};
    this.cache.data = {};
    this.cache.context = {};
    this.views = {};
    this.stash = {};
    this.set('Views', require('./lib/views'));

    this.viewTypes = {
      layout: [],
      renderable: [],
      partial: []
    };

    this.collections = {};
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
  },

  set: function (key, value) {
    this.cache[key] = value;
    return this;
  },

  get: function (key) {
    return this.cache[key];
  },

  /**
   * Load data onto `app.cache.data`
   */

  data: function(key, val) {
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
        return get(this.cache.data, key);
      }
      if (type === 'object') {
        this.visit('data', key);
        return this;
      }
    }
    set(this.cache.data, key, val);
    this.emit('data', key, val);
    return this;
  },

  /**
   * Set or get an option on the instance.
   */

  option: function(key, val) {
    var len = arguments.length;
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

  create: function (name/*, options, loaders*/) {
    var args = utils.slice(arguments, 1);
    var opts = clone(args.shift());

    var single = inflect.singularize(name);
    var plural = inflect.pluralize(name);
    this.inflections[single] = plural;

    opts.renameKey = opts.renameKey || this.options.renameKey;
    opts.loaderType = opts.loaderType || this.options.loaderType || 'sync';
    opts.plural = plural;
    opts.inflection = single;
    opts.loaders = args;
    opts.app = this;

    var Views = this.get('Views');
    var views = new Views(opts);
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
   * Create a new collection with the given `name` and `items.`
   *
   * @param  {String} `name`
   * @return {String}
   * @api private
   */

  collection: function(name, items) {
    return (this.collections[name] = new Collection(items));
  },

  /**
   * Rename view keys.
   */

  renameKey: function (key, fn) {
    if (typeof key === 'function') {
      this.options.renameKey = key;
      return key;
    }
    if (typeof fn !== 'function') {
      fn = this.options.renameKey;
    }
    if (typeof fn !== 'function') {
      fn = utils.identity;
    }
    this.options.renameKey = fn;
    return fn ? fn(key) : key;
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

    // TODO: this code shouldn't be needed! there is a normalization
    // bug somewhere!
    function setLayout(val) {
      val.data = val.data || {};
      val.locals = val.locals || {};
      val.layout = val.layout || val.locals.layout || val.data.layout;
      return val;
    }

    while (len--) {
      var views = this.views[alias[i++]];
      for (var key in views) {
        var val = views[key];
        if (views.hasOwnProperty(key) && typeof val !== 'function' && val.path) {
          stack[key] = setLayout(val);
        }
      }
    }

    // get the name of the first layout
    var name = view.layout;
    var str = view.content;

    // apply the layout
    var res = layouts(str, name, stack, opts);
    // console.log(res.stack);
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
    if (typeof view === 'function') return view.call(this);

    // if `view` is a string, see if it's a cache view
    if (typeof view === 'string') view = this.lookup(view);

    // add `locals` to `view.contexts`
    view.ctx('render', locals);

    // handle `preRender` middleware
    this.handleView('preRender', view, locals);

    // build the context for the view
    var ctx = this.context(locals);

    // get the engine
    var engine = this.engine(view.getEngine(ctx));
    if (typeof engine === 'undefined') {
      throw this.error('engine', path.extname(view.path));
    }
    if (!engine.hasOwnProperty('render')) {
      throw this.error('render', JSON.stringify(view));
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

      forOwn(collection, function (view, key) {
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

    // add partials to the context to pass to engines
    // mixin(ctx, this.cache.context.partials);
    mixin(obj, this.cache.data);
    mixin(obj, view.data);
    mixin(obj, view.locals);
    mixin(obj, locals);

    // var overrides = utils.bindAll(obj.overrides, view);

    // ensure that `overrides` are last
    // obj = mixin({}, obj, overrides);
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

    // replace methods on `view` that usually return the instance
    // with methods that return a value (to be used as helpers)
    // var overrides = utils.bindAll(locals.overrides, view);

    locals.helpers = utils.bindAll(helpers, thisArg);
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
   * Call the given method on each value in `obj`.
   */

  visit: function (method, obj) {
    visit(this, method, obj);
    return this;
  },

  /**
   * Call the given method on each value in `obj`.
   */

  mapVisit: function (method, arr) {
    utils.mapVisit(this, method, arr);
    return this;
  }
});

/**
 * Expose `Template`
 */

module.exports = Template;
