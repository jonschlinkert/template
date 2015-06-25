'use strict';

// require('time-require');

var forOwn = require('for-own');
var router = require('en-route');
var layouts = require('layouts');
var MapCache = require('map-cache');
var Emitter = require('component-emitter');
var extend = require('extend-shallow');
var Loaders = require('loader-cache');
var inflect = require('pluralize');
var get = require('get-value');

var engines = require('./lib/engines');
var loaders = require('./lib/loaders/index');
var helpers = require('./lib/helpers');
var Views = require('./lib/views');
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
  this.loaders = new Loaders(options);
  this.init();
}

/**
 * Template methods
 */

Template.prototype = Emitter({
  constructor: Template,

  init: function () {
    this._ = {};
    engines(this);
    helpers(this);
    this.options = {
      layoutDelims: ['{%', '%}'],
      layoutTag: 'body'
    };
    this.stash = new MapCache();
    this.errors = {
      compile: 'Template#compile expects engines to have a compile method',
      render: 'Template#render expects engines to have a render method',
    };
    this.cache = {};
    this.cache.data = {};
    this.cache.context = {};
    this.views = {};
    this.viewTypes = {
      layout: [],
      renderable: [],
      partial: []
    };
    this.inflections = {};
    this.handlers(utils.methods);

    this.iterator('sync', loaders.iterators.sync);
  },

  /**
   * Format an error
   */

  error: function(id, msg) {
    throw new Error(this.errors[id] + msg);
  },

  /**
   * Create a new `Views` collection.
   */

  create: function (single, options, loaders) {
    var args = utils.slice(arguments, 1);
    var opts = args.shift();

    var plural = this.inflect(single);
    opts.loaderType = opts.loaderType || 'sync';
    opts.collection = plural;
    opts.inflection = single;

    var views = new Views(opts, args, this);
    this.viewType(plural, views.viewType());

    // add the collection to `views`
    this.views[plural] = views;
    var self = this;

    var load = function(key, val) {
      views.set(key, val);
      return views;
    }.bind(views);

    // load views onto the collection
    this.loaders.on('preLoad', function (args, stack) {
      if (stack.length === 0) {
        stack.push(load);
      }
    });

    // load views onto the collection
    this.loaders.on('data', load);

    // get the loader for the collection
    var loaders = this.loaders.resolve(args);
    var loader = this.loaders.compose(plural);

    // decorate named loader methods to the collection.
    // this allows chaining `.pages` etc
    utils.defineProp(views, plural, loader);
    utils.defineProp(views, single, loader);

    // forward collection methods onto loader
    loader.__proto__ = views;

    // add loader methods to the instance
    this.mixin(single, loader);
    this.mixin(plural, loader);
    return this;
  },

  /**
   * Placeholder for initializing views that have not been
   * inititalized already.
   */

  lazyLoad: function(view) {
    if (typeof view.options === 'undefined') {
      view.options = view.options || {};
      view.options.handled = view.options.handled || [];
    }
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
   * Find a stashed view.
   */

  lookup: function (key) {
    var collection = this.stash.get(key);
    return this.views[collection][key];
  },

  /**
   * Add a new `Iterator` to the instance.
   */

  iterator: function (name, fn) {
    this.loaders.iterator(name, fn);
    return this;
  },

  /**
   * Add a new `Loader` to the instance.
   */

  loader: function (name, opts, fn) {
    // if (arguments.length === 1) {
    //   opts = extend({loaderType: 'sync'}, opts);
    //   return this.loaders[opts.loaderType];
    // }
    this.loaders.set(name, opts, fn);
    return this;
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
    this.lazyLoad(view);

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

  handleView: function (method, view/*, locals, cb*/) {
    if (view.options.handled.indexOf(method) === -1) {
      this.handle.apply(this, arguments);
    }
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

    locals = locals || {};

    // get the engine to use
    var engine = this.engine(view.getEngine(locals));
    if (!engine || !engine.hasOwnProperty('compile')) {
      this.error('compile', engine);
    }

    // build the context to pass to the engine
    var ctx = this.context(view, locals);

    // apply layout
    view = this.applyLayout(view, ctx);

    // Bind context to helpers before passing to the engine.
    this.bindHelpers(locals, ctx, isAsync);

    // handle `preCompile` middleware
    this.handleView('preCompile', view, ctx);

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

    // handle `preRender` middleware
    this.handleView('preRender', view, locals);

    // get the engine
    var engine = this.engine(view.getEngine(locals));
    if (!engine || !engine.hasOwnProperty('render')) {
      this.error('render', engine);
    }

    // build the context for the view
    var ctx = this.context(view, locals);

    // if it's not already compiled, do that first
    if (typeof view.fn !== 'function') {
      try {
        var isAsync = typeof cb === 'function';
        view = this.compile(view, ctx, isAsync);
        return this.render(view, locals, cb);
      } catch (err) {
        return cb.call(this, err);
      }
    }

    // render the view
    return engine.render(view.content, ctx, function (err, res) {
      if (err) return cb.call(this, err);
      view.content = res;

      // handle `postRender` middleware
      this.handle('postRender', view, locals, cb);
    }.bind(this));
  },

  /**
   * Load data onto `app.cache.data`
   */

  data: function (prop, value) {
    if (typeof prop === 'object') {
      this.visit('data', prop);
    } else {
      this.emit('data', prop, value);
      this.cache.data[prop] = value;
    }
    return this;
  },

  /**
   * Set or get an option on the instance.
   */

  option: function (prop, value) {
    if (typeof prop === 'object') {
      this.visit('option', prop);
    } else if (typeof prop == 'string' && arguments.length === 1) {
      return this.options[prop];
    } else {
      this.emit('option', prop, value);
      this.options[prop] = value;
    }
    return this;
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
        this.handle('onMerge', view, locals);

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
    extend(ctx, view.omit(view.keys()));
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
    if (isAsync) {
      extend(helpers, this._.helpers.async);
    }
    extend(helpers, locals.helpers);

    // build the context (exposed as `this` in helpers)
    var ctx = {};
    ctx.options = extend({}, this.options.helper, locals);
    ctx.context = context || {};
    ctx.app = this;

    locals.helpers = utils.bindAll(helpers, ctx);
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
   * Add a router handler.
   *
   * @param  {String} `method` Method name.
   * @return {[type]}
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
  }
});


/**
 * Expose `Template`
 */

module.exports = Template;
