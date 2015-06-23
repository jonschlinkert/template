'use strict';

var path = require('path');
var router = require('en-route');
var layouts = require('layouts');
var Engines = require('engine-cache');
var Emitter = require('component-emitter');
var extend = require('extend-shallow');
var Loaders = require('loader-cache');
var inflect = require('pluralize');
var engines = require('./lib/engines');
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

Emitter(Template.prototype);

/**
 * Template methods
 */

Template.prototype = {
  constructor: Template,

  init: function () {
    this._ = {};
    engines(this);
    helpers(this);
    this.options = {
      layoutDelims: ['{%', '%}'],
      layoutTag: 'body'
    };
    this.cache = {};
    this.views = {};
    this.viewTypes = {
      layout: [],
      renderable: [],
      partial: []
    };
    this.inflections = {};
  },

  /**
   * Create a new `Views` collection.
   */

  create: function (single, opts, loaders) {
    var views = new Views(opts, loaders, this);
    var plural = this.inflect(single);

    views.option('collection', plural);
    views.option('inflection', single);
    this.viewType(plural, views.viewType());

    // add the collection to `views`
    this.views[plural] = views;

    // add loader methods to the instance
    this.mixin(single, views.load.bind(views));
    this.mixin(plural, views.load.bind(views));

    // forward collection methods onto loaders
    this[single].__proto__ = views;
    this[plural].__proto__ = views;
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
    this.loaders.loader(name, opts, fn);
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
    if (typeof cb !== 'function') {
      cb = this.handleError(method, view);
    }

    this.lazyRouter();
    view.options.method = method;
    view.options.handled.push(method);
    view.emit('handle', method);

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
   * @return {Array} Returns an array of template objects with rendered content.
   */

  handleView: function (method, view, locals, cb) {
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

  param: function(name, fn) {
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
    if (typeof locals === 'Boolean') {
      isAsync = locals;
      locals = {};
    }
    locals = locals || {};

    var ext = view.getEngine(locals);
    var engine = this.engine(ext);

    var ctx = this.context(view, locals);
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
    var ext = view.getEngine(locals);
    var engine = this.engine(ext);

    // build the context for the view
    var ctx = this.context(view, locals);

    // if it's not already compiled, do that first
    if (typeof view.fn !== 'function') {
      try {
        view = this.compile(view, ctx, (typeof cb === 'function'));
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
   * Build the context for the given `view` and `locals`.
   */

  bindHelpers: function (locals, context, isAsync) {
    var helpers = {};
    extend(helpers, this.options.helpers);
    extend(helpers, this._.helpers.sync);
    extend(helpers, this._.helpers.async);
    extend(helpers, locals.helpers);

    // build the context (exposed as `this` in helpers)
    var ctx = {};
    ctx.options = extend({}, this.options.helper, locals);
    ctx.context = context || {};
    ctx.app = this;

    locals.helpers = utils.bindAll(helpers, ctx);
  },

  /**
   * Set or get an option on the instance.
   */

  option: function (prop, value) {
    if (typeof prop === 'object') {
      this.visit('option', prop);
    } else {
      this.options[prop] = value;
    }
    return this;
  },

  /**
   * Build the context for the given `view` and `locals`.
   */

  context: function (view, locals) {
    var ctx = {};
    extend(ctx, this.cache.data);
    extend(ctx, view);
    extend(ctx, view.context(locals));
    return ctx;
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
  }
};

/**
 * Add Router methods to Template.
 */

utils.methods.forEach(function(method) {
  Template.prototype[method] = function(path) {
    this.lazyRouter();

    var route = this.router.route(path);
    var args = [].slice.call(arguments, 1);
    route[method].apply(route, args);
    return this;
  };
});

/**
 * Expose `Template`
 */

module.exports = Template;
