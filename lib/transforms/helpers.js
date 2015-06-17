'use strict';

var extend = require('extend-shallow');
var debug = require('../debug');
var utils = require('../utils');

module.exports = function (app) {

  app.mixin('loadHelpers', function() {
    var fn = this.loaders.helpers['default'][0];
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
    this._.helpers.async.addHelpers(this.loadHelpers(helpers, options));
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
      var context = extend({}, this.context, locals);
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
      var context = extend({}, this.context, locals);
      template.render(context, function (err, content) {
        if (err) return cb(err);
        cb(null, content);
        return;
      });
    });
  });
};
