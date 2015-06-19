'use strict';

var HelperCache = require('helper-cache');
var extend = require('extend-shallow');
var debug = require('../debug');
var utils = require('../utils');


module.exports = function (app) {

  /**
   * Private method for registering helper types.
   */

  app.mixin('helperType', function(type) {
    this._.helpers[type] = new HelperCache({bind: false});
  });

  /**
   * Load helpers.
   *
   * @param  {String|Array|Object} `value` String or array of glob patterns, or an object of helpers.
   * @return {Object}
   * @api public
   */

  app.mixin('loadHelpers', function() {
    var fn = this.compose({loaderType: 'sync'}, ['helpers']);
    return fn.apply(this, arguments);
  });

  /**
   * Register generic template helpers that can be used with any engine.
   *
   * Helpers registered using this method will be passed to every
   * engine, so this method is best for generic javascript functions -
   * unless you want to see Lo-Dash blow up from `Handlebars.SafeString`.
   *
   * ```js
   * template.helper('lower', function(str) {
   *   return str.toLowerCase();
   * });
   * ```
   *
   * @param {String} `key` Helper name
   * @param {Function} `fn` Helper function.
   * @api public
   */

  app.mixin('helper', function(name, fn) {
    debug.helper('adding helper: %s', name);
    this._.helpers.sync.addHelper(name, fn);
    return this;
  });

  /**
   * Get a helper.
   *
   * @param {String} `name` Helper name.
   * @api public
   */

  app.mixin('getHelper', function(name) {
    return this._.helpers.sync.getHelper(name);
  });

  /**
   * Get an async helper.
   *
   * @param {String} `name` Helper name.
   * @api public
   */

  app.mixin('getAsyncHelper', function(name) {
    return this._.helpers.async.getHelper(name);
  });

  /**
   * Register multiple helpers.
   *
   * ```js
   * template.addHelpers({
   *   a: function() {},
   *   b: function() {},
   *   c: function() {},
   * });
   * ```
   *
   * @param {Object|Array} `helpers` Object, array of objects, or glob patterns.
   * @api public
   */

  app.mixin('helpers', function(helpers, options) {
    debug.helper('adding helpers: %s', helpers);
    if (utils.isObject(helpers)) {
      this._.helpers.sync.addHelpers(helpers);
    } else {
      this._.helpers.sync.addHelpers(this.loadHelpers(helpers, options));
    }
    return this;
  });

  /**
   * Register generic async template helpers that are not specific to an
   * engine.
   *
   * As with the sync version, helpers registered using this method will
   * be passed to every engine, so this method is best for generic
   * javascript functions.
   *
   * ```js
   * template.asyncHelper('lower', function(str, next) {
   *   str = str.toLowerCase();
   *   next();
   * });
   * ```
   *
   * @param {String} `name` Helper name.
   * @param {Function} `fn` Helper function
   * @api public
   */

  app.mixin('asyncHelper', function(name, fn) {
    debug.helper('adding async helper: %s', name);
    this._.helpers.async.addAsyncHelper(name, fn);
    return this;
  });

  /**
   * Register multiple async helpers.
   *
   * ```js
   * template.addAsyncHelpers({
   *   a: function() {},
   *   b: function() {},
   *   c: function() {},
   * });
   * ```
   *
   * @param {Object|Array} `helpers` Object, array of objects, or glob patterns.
   * @api public
   */

  app.mixin('asyncHelpers', function(helpers, options) {
    debug.helper('adding async helpers: %s', helpers);
    this._.helpers.async.addAsyncHelpers(this.loadHelpers(helpers, options));
    return this;
  });

  /**
   * Register an object of helpers for the given `ext` (engine).
   *
   * ```js
   * template.helpers(require('handlebars-helpers'));
   * ```
   *
   * @param {String} `ext` The engine to register helpers with.
   * @return {Object} Object of helpers for the specified engine.
   * @api public
   */

  app.mixin('engineHelpers', function(ext) {
    debug.helper('helpers for engine: %s', ext);
    return this.getEngine(ext).helpers;
  });

  /**
   * Create helpers for each default template `type`.
   *
   * @param {String} `type` The type of template.
   * @param {String} `plural` Plural form of `type`.
   * @api private
   */

  app.mixin('defaultHelper', function(collectionName, plural) {
    app.helper(collectionName, function (key, locals) {
      var template = app.getView(plural, key);
      if (!template) {
        app.error('defaultHelper', 'cannot find: ' + key);
        return '';
      }
      locals = locals || {};
      var context = extend({}, this.context, locals, locals.hash);
      var content = template.render(context);
      if (content instanceof Error) {
        throw content;
      }
      return content;
    });
  });

  /**
   * Create async helpers for each default template `type`.
   *
   * @param {String} `type` The type of template.
   * @param {String} `plural` Plural form of `type`.
   * @api private
   */

  app.mixin('defaultAsyncHelper', function(collectionName, plural) {
    app.asyncHelper(collectionName, function (key, locals, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      options = options || {};
      var template = this.app.getView(plural, key);
      var args = [].slice.call(arguments, 1);
      cb = args.pop();

      if (!template) {
        this.app.error('defaultAsyncHelper:', 'cannot find template: ' + key);
        return cb(null, '');
      }

      if (args.length === 0) {
        locals = {};
      }

      var context = extend({}, this.context, locals, options.hash);
      template.render(context, function (err, content) {
        if (err) return cb(err);
        cb(null, content);
        return;
      });
    });
  });
};
