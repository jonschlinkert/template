'use strict';

var extend = require('extend-shallow');
var utils = require('../utils');
var debug = utils.debug;

module.exports = function (app) {

  /**
   * Private method for registering an engine. Register the given view
   * engine callback `fn` as `ext`.
   *
   * @param {String} `ext`
   * @param {Function|Object} `fn` or `options`
   * @param {Object} `options`
   * @return {Object} `Template` to enable chaining
   * @api private
   */
  app.mixin('registerEngine', function(ext, fn, options) {
    debug.engine('.registerEngine:', arguments);
    var opts = extend({}, options);
    ext = ext ? utils.formatExt(ext) : '';
    this._.engines.setEngine(ext, fn, opts);
    return this;
  });

  /**
   * Register the given view engine callback `fn` as `ext`. If only `ext`
   * is passed, the engine registered for `ext` is returned. If no `ext`
   * is passed, the entire cache is returned.
   *
   * @doc api-engine
   * @param {String|Array} `exts` File extension or array of extensions.
   * @param {Function|Object} `fn` or `options`
   * @param {Object} `options`
   * @return {Object} `Template` to enable chaining
   * @api public
   */
  app.mixin('engine', function(exts, fn, opts) {
    debug.engine('.engine:', arguments);
    exts = utils.arrayify(exts);
    var len = exts.length;
    while (len--) this.registerEngine(exts[len], fn, opts);
    return this;
  });

  /**
   * Get the engine settings registered for the given `ext`.
   *
   * ```js
   * template.getEngine('.html');
   * ```
   *
   * @doc api-getEngine
   * @param {String} `ext` The engine to get.
   * @return {Object} Object with methods and settings for the specified engine.
   * @api public
   */
  app.mixin('getEngine', function(ext) {
    debug.engine('.getEngine: %s', ext);
    ext = ext || this.option('view engine');
    return this._.engines.getEngine(ext);
  });
};
