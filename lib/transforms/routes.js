'use strict';

var lazy = require('lazy-cache')(require);
var flatten = lazy('arr-flatten');
var routes = lazy('en-route');
var debug = require('../debug');
var utils = require('../utils');

/**
 * Route methods
 */

module.exports = function (app) {
  var Router = routes().Router;

  /**
   * Expose `Router` and `Route`
   */

  app.mixin('Router', routes().Router);
  app.mixin('Route', routes().Route);

  /**
   * Lazily initalize router, to allow options to
   * be passed in after init.
   */

  app.mixin('lazyrouter', function() {
    if (!this.router) {
      app.mixin('router', new Router({
        caseSensitive: this.enabled('case sensitive routing'),
        strict: this.enabled('strict routing'),
        methods: utils.methods.concat(this.option('router methods'))
      }));
    }
  });

  /**
   * Dispatch `file` through its middleware stack
   *
   * @param {String} `method` method to dispatch files to (undefined will dispatch to `all`)
   * @param  {Object} `file` File object to be passed through the middleware stack
   * @api private
   */

  app.mixin('handle', function(method, file, done) {
    debug.routes('.handle: ', arguments);
    if (typeof method === 'object') {
      done = file;
      file = method;
      method = null;
    }

    file.options = file.options || {};
    file.options.method = method;
    if (typeof done !== 'function') {
      done = handleError(method, file);
    }

    if (!this.router) {
      debug.routes('no routes defined on engine');
      return done();
    }
    this.router.handle(file, done);
  });

  /**
   * Dispatch `file` through an array of middleware functions.
   *
   * @param  {Object} `file`
   * @param  {Array} `fns`
   * @api private
   */

  app.mixin('dispatch', function(method, file, fns) {
    for (var key in file) {
      if (file.hasOwnProperty(key)) {
        var value = file[key];
        if (fns) this.route(value.path).all(fns);
        this.handle(method, value, handleError(method, {path: key}));
      }
    }
  });

  /**
   * Proxy to the engine `Router#route`
   * Returns a new `Route` instance for the `path`.
   *
   * Routes are isolated middleware stacks for specific paths.
   * See the `Route` api docs for details.
   *
   * @param {String} `path`
   * @api public
   */

  app.mixin('route', function(path) {
    debug.routes('route: %s', path);
    this.lazyrouter();
    return this.router.route(path);
  });

  /**
   * Proxy to `Router#param` with one added api feature. The `name` parameter
   * can be an array of names.
   *
   * See the `Router#param` docs for more details.
   *
   * @param {String|Array} `name`
   * @param {Function} `fn`
   * @return {Object} `Template` for chaining
   * @api public
   */

  app.mixin('param', function(name, fn) {
    debug.routes('param: %s', name);
    this.lazyrouter();
    if (Array.isArray(name)) {
      var len = name.length, i = 0;
      while (len--) this.param(name[i++], fn);
      return this;
    }
    this.router.param(name, fn);
    return this;
  });

  /**
   * Proxy to `Router#use` to add middleware to the engine router.
   * See the `Router#use` documentation for details.
   *
   * If the `fn` parameter is an engine, then it will be
   * mounted at the `route` specified.
   *
   * ```js
   * template.use(/\.md$/, function (file, next) {
   *   // do stuff next();
   * });
   * ```
   *
   * @param {Function} `fn`
   */

  app.mixin('use', function (fn) {
    var offset = 0, path = '/';
    // default path to '/'
    if (typeof fn !== 'function') {
      var arg = fn;
      while (Array.isArray(arg) && arg.length !== 0) {
        arg = arg[0];
      }
      // if the first arg is the path, offset by 1
      if (typeof arg !== 'function') {
        offset = 1;
        path = fn;
      }
    }

    var fns = flatten()([].slice.call(arguments, offset));
    if (fns.length === 0) {
      throw this.error('use', 'expects middleware functions', arguments);
    }

    this.lazyrouter();
    var router = this.router;
    var len = fns.length, i = 0;

    while (len--) {
      var mfn = fns[i++];
      // non-Template instance
      if (!mfn || !mfn.handle || !mfn.set) {
        router.use(path, mfn.bind(this));
      }
      debug.routes('use: %s', path);
      mfn.mountpath = path;
      mfn.parent = this;
    }
    return this;
  });

  /**
   * Delegate `.METHOD(...)` calls to `router.METHOD(...)`
   *
   * @param {String} `path`
   * @param {Function} Callback
   * @return {Object} `Template` for chaining
   * @api public
   */

  utils.methods.forEach(function(method) {
    app.mixin(method, function(path) {
      debug.routes('%s: %s', method, path);
      this.lazyrouter();

      var route = this.router.route(path);
      var len = arguments.length - 1;
      var args = new Array(len);

      for (var i = 0; i < len; i++) {
        args[i] = arguments[i + 1];
      }
      route[method].apply(route, args);
      return this;
    });
  });

  /**
   * Special-cased "all" method, applying the given route `path`,
   * middleware, and callback.
   *
   * ```js
   * template.all(/\.md$/, function (file, next) {
   *   // do stuff next();
   * });
   * ```
   *
   * @param {String} `path`
   * @param {Function} `callback`
   * @return {Object} `Template` for chaining
   * @api public
   */

  app.mixin('all', function(path) {
    debug.routes('all: %s', path);
    this.lazyrouter();
    var route = this.router.route(path);
    var len = arguments.length - 1;
    var args = new Array(len);

    for (var i = 0; i < len; i++) {
      args[i] = arguments[i + 1];
    }
    route.all.apply(route, args);
    return this;
  });
};

/**
 * Middleware error handler
 *
 * @param {Object} `template`
 * @param {String} `method` name
 * @api private
 */

function handleError(method, template) {
  return function (err) {
    if (err) {
      err.reason = 'Error running ' + method + ' middleware: ' + JSON.stringify(template);
      console.error(err);
      return err;
    }
  };
}
