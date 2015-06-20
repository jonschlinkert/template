'use strict';

var lazy = require('lazy-cache')(require);
var lazyAsync = lazy('async');
var lazyThrough = lazy('through2');
var error = lazy('plugin-error');
var isObject = require('isobject');
var merge = require('mixin-deep');
var extend = require('extend-shallow');
var typeOf = require('kind-of');
var utils = require('../utils');
var debug = utils.debug;

/**
 * Convience methods for finding templates.
 */

module.exports = function (app) {

  /**
   * Base compile method. Use `engine` to compile `content` with the
   * given `options`
   *
   * @param  {Object} `engine` Engine object, with `.compile` method
   * @param  {Object} `content` The content string to compile.
   * @param  {Object} `options` options to pass to registered view engines.
   * @return {Function} The compiled template string.
   * @api private
   */

  app.mixin('compileBase', function(engine, template, options) {
    this.assert('compileBase', 'engine.compile', 'function', engine.compile);
    try {
      template.fn = engine.compile(template.content, options);

      // handle post-compile middleware
      this.handleTemplate('postCompile', template);
      return template.fn;
    } catch (err) {
      return err;
    }
  });

  /**
   * Compile content on the given `template` object with the specified
   * engine `options`.
   *
   * @param  {Object} `template` The template object with content to compile.
   * @param  {Object} `options` Options to pass along to the engine when compile. May include a `context` property to bind to helpers.
   * @return {Object} Template object to enable chaining.
   * @api public
   */

  app.mixin('compileTemplate', function(template, settings, isAsync) {
    this.assert('compileTemplate', 'template', 'object', template);

    // store this context
    this.context(template, 'compile', settings);

    // reference to settings in case helpers are needed later
    var opts = settings || {};
    var context = opts.context || {};
    delete opts.context;
    opts.async = isAsync;

    // handle "preCompile" middleware routes before layout is applied
    this.handleTemplate('preCompile', template);

    // if a layout is defined, apply it before compiling
    this.applyLayout(template, extend({}, context, opts));

    // Bind context to helpers before passing to the engine.
    this.bindHelpers(opts, context, isAsync);
    opts.debugEngine = this.enabled('debugEngine');

    // get the engine to use
    var engine = this.getEngine(opts.engine || template.engine);

    // compile template
    return this.compileBase(engine, template, extend({}, opts, context));
  });

  /**
   * Compile `content` with the given `options`.
   *
   * @param  {Object|String} `file` String or normalized template object.
   * @param  {Object} `options`
   * @param  {Boolean} `isAsync` Load async helpers
   * @return {Function} Compiled function.
   * @api public
   */

  app.mixin('compile', function(content, options, isAsync) {
    if (typeOf(content) === 'object') {
      return this.compileTemplate(content, options, isAsync);
    }
    if (typeof content !== 'string') {
      throw this.error('compile', 'expects a string or object', content);
    }
    var template = this.findRenderable(content);
    if (typeOf(template) === 'object') {
      return this.compileTemplate(template, options, isAsync);
    }
    return this.compileString(content, options, isAsync);
  });

  /**
   * Compile the given string with the specified `options`.
   *
   * The primary purpose of this method is to get the engine before
   * passing args to `.compileBase`.
   *
   * @param  {String} `str` The string to compile.
   * @param  {Object} `options` Options to pass to registered view engines.
   * @param  {Boolean} `async` Load async helpers
   * @return {Function}
   * @api public
   */

  app.mixin('compileString', function(content, options, isAsync) {
    this.assert('compileString', 'content', 'string', content);
    if (typeof options === 'boolean') {
      isAsync = options;
      options = {};
    }
    options = extend({locals: {}}, options);
    var template = { content: content, locals: options.locals, options: options };
    this.handleTemplate(template, 'onLoad');
    return this.compileTemplate(template, options, isAsync);
  });

  /**
   * Base render method. Use `engine` to render `content` with the
   * given `options` and `callback`.
   *
   * @param  {Object} `engine` Engine object, with `.render` and/or `.renderSync` method(s)
   * @param  {Object} `content` The content string to render.
   * @param  {Object} `options` Locals and/or options to pass to registered view engines.
   * @param  {Function} `cb` If a callback is passed, `.render` is used, otherwise `.renderSync` is used.
   * @return {String} The rendered template string.
   * @api private
   */

  app.mixin('renderBase', function(engine, content, options, cb) {
    debug.render('renderBase:', arguments);
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    if (typeof cb !== 'function') {
      return this.renderSync(engine, content, options);
    }
    return this.renderAsync(engine, content, options, cb);
  });

  /**
   * Render content on the given `template` object with the specified
   * engine `options` and `callback`.
   *
   * @param  {Object} `template` The template object with content to render.
   * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
   * @return {String}
   * @api public
   */

  app.mixin('renderTemplate', function(template, locals, cb) {
    debug.render('renderTemplate: %j', template);
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }
    if (!isObject(template)) {
      var error = this.error('renderTemplate', 'expects template to be an object', template);
      if (typeof cb === 'function') return cb(error);
      throw error;
    }

    this.context(template, 'render', locals);

    // find any options passed in on locals
    locals = locals || {};
    template.path = template.path || '.';
    var app = this;

    // if postCompile wasn't called before, call it now.
    this.handleTemplate('postCompile', template);

    // handle pre-render middleware routes
    this.handleTemplate('preRender', template);

    // Merge `.render` locals with template locals
    locals = this.mergeContext(template, locals);

    // shallow clone any options set on the `locals` object
    var opts = extend({}, locals.options);

    // find the engine to use for rendering templates
    var engine = this.getEngine(template.engine);
    opts = extend({}, engine.options, opts);

    var isAsync = typeOf(cb) === 'function';

    // compile the template if it hasn't been already
    if (typeOf(template.fn) !== 'function') {
      opts.context = opts.context || locals;
      template.fn = this.compileTemplate(template, opts, isAsync);

      // handle post-compile middleware
      this.handleTemplate('postCompile', template);
    }

    // for engines that don't support compile, we need to merge
    // in the `context` and `delims` for backwards compatibility
    if (typeof content === 'string') {
      locals = extend({}, locals, opts);
    }

    var content = template.fn;
    if (!isAsync) {
      template.content = this.renderBase(engine, content, locals);
      // handle post-render middleware routes
      this.handle('postRender', template, this.handleError('postRender', template));
      return template.content;
    }

    return this.renderBase(engine, content, locals, function (err, content) {
      if (err) return cb.call(app, err);

      // update the `content` property with the rendered result, so we can
      // pass the entire template object to the postRender middleware
      template.content = content;
      app.handle('postRender', template, this.handleError('postRender', template));

      // final rendered string
      return cb.call(app, null, template.content);
    });
  });

  /**
   * Base async render method. Uses the given `engine` to render
   * `content` with the given `options` and `callback`.
   *
   * @param  {Object} `engine` Engine object, with `.render` and/or `.renderSync` method(s)
   * @param  {Object} `content` The content string to render.
   * @param  {Object} `options` Locals and/or options to pass to registered view engines.
   * @param  {Function} `cb` If a callback is passed, `.render` is used, otherwise `.renderSync` is used.
   * @return {String} The rendered template string.
   * @api private
   */

  app.mixin('renderAsync', function(engine, content, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    if (!engine.hasOwnProperty('render')) {
      return cb(this.error('renderAsync', 'no .render method found on engine', engine));
    }
    try {
      var app = this;
      engine.render(content, options, function (err, res) {
        if (err) return cb(err);
        return cb.call(app, null, res);
      });
    } catch (err) {
      return cb.call(app, err);
    }
  });

  /**
   * Base sync render method. Uses the given `engine` to render
   * `content` with the given `options`.
   *
   * @param  {Object} `engine` Engine object must have a `.renderSync` method.
   * @param  {Object} `content` The content string to render.
   * @param  {Object} `options` Locals and/or options to pass to registered view engines.
   * @return {String} The rendered template string.
   * @api private
   */

  app.mixin('renderSync', function(engine, content, options) {
    if (!engine.hasOwnProperty('renderSync')) {
      throw this.error('renderSync', '.renderSync method not found on engine', engine);
    }
    try {
      return engine.renderSync(content, options);
    } catch (err) {
      throw err;
    }
  });

  /**
   * Render `content` with the given `options` and optional `callback`.
   *
   * @param  {Object|String} `file` String or normalized template object.
   * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
   * @return {String} Rendered string.
   * @api public
   */

  app.mixin('render', function(content, locals, cb) {
    debug.render('render:', arguments);
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }
    if (!content) {
      var err = this.error('render', 'expects a string or object', arguments);
      if (typeof cb === 'function') return cb(err);
      throw err;
    }

    var template = typeOf(content) === 'string'
      ? this.findRenderable(content)
      : content;

    if (typeOf(template) === 'object') {
      return this.renderTemplate(template, locals, cb);
    }
    return this.renderString(content, locals, cb);
  });

  /**
   * Render the given string with the specified `locals` and `callback`.
   *
   * The primary purpose of this method is to get the engine before
   * passing args to `.renderBase`.
   *
   * @param  {String} `str` The string to render.
   * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
   * @return {String}
   * @api public
   */

  app.mixin('renderString', function(str, locals, cb) {
    this.assert('renderString', 'str', 'string', str);
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var file = { content: str, locals: locals || {}};
    this.handleTemplate('onLoad', file);
    return this.renderTemplate(file, locals, cb);
  });

  /**
   * Render the given string with the specified `locals` and `callback`.
   *
   * The primary purpose of this method is to get the engine before
   * passing args to `.renderBase`.
   *
   * @param  {String} `str` The string to render.
   * @param  {Object} `locals` Locals and/or options to pass to registered view engines.
   * @return {String}
   * @api public
   */

  app.mixin('renderFile', function(locals) {
    var through = lazyThrough();
    var app = this;

    return through.obj(function (file, enc, cb) {
      app.handleTemplate('onLoad', file);

      locals = merge({}, locals, file.data, file.locals);
      var stream = this;

      app.render(file, locals, function (err, content) {
        if (err) {
          var PluginError = error();
          stream.emit('error', new PluginError('renderFile', err));
          return cb(err);
        }
        file.contents = new Buffer(content);
        stream.push(file);
        return cb();
      });
    });
  });

  /**
   * Render each item in a collection.
   *
   * ```js
   * template.renderEach('pages', function(err, res) {
   *   //=> array of rendered page objects
   * });
   * ```
   *
   * @param  {String} `collection` The name of the collection to render.
   * @param  {Object} `locals` Locals object and/or options to pass to the engine as context.
   * @return {Array} Array of rendered strings.
   * @api public
   */

  app.mixin('renderEach', function(collection, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }
    if (typeof cb !== 'function') {
      return this.renderEachSync(collection, locals);
    }
    return this.renderEachAsync(collection, locals, cb);
  });

  /**
   * Render each template in the given collection asynchronously.
   *
   * @param  {Object} `collection` Collection name
   * @param  {Object} `locals`
   * @param  {Object} `cb` callback
   * @return {Array} Returns an array of template objects with rendered content.
   */

  app.mixin('renderEachAsync', function(collection, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }
    var views = this.getViews(collection);
    var keys = Object.keys(views);
    var async = lazyAsync();

    async.map(keys, function (key, next) {
      var file = views[key];

      app.render(file, locals, function (err, content) {
        if (err) return next(err);
        file.content = content;
        return next(null, file);
      });
    }, cb);
  });

  /**
   * Render each template in the given collection synchronously.
   *
   * @param  {Object} `collection` Collection name
   * @param  {Object} `locals`
   * @return {Array} Returns an array of template objects with rendered content.
   */

  app.mixin('renderEachSync', function(collection, locals) {
    var views = this.getViews(collection);
    var res = [];
    for (var key in views) {
      res.push(views[key].render(locals));
    }
    return res;
  });

  /**
   * Run the given handler method if the file has not already been
   * handled by that method
   *
   * @param  {Object} `collection` Collection name
   * @param  {Object} `locals`
   * @return {Array} Returns an array of template objects with rendered content.
   */

  app.mixin('handleTemplate', function (method, file) {
    var hasMethod = utils.getProp(file, ['options.method', method]);
    if (!hasMethod) {
      this.handle(method, file, this.handleError(method, {
        path: file.path
      }));
    }
  });
};
