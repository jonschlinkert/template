'use strict';

var Helpers = require('helper-cache');
var utils = require('../utils');

module.exports = function (app) {
  app._.helpers = {};
  app._.helpers.sync = new Helpers({ bind: false });
  app._.helpers.async = new Helpers({ bind: false });

  app.visit('mixin', {

    /**
     * Load helpers.
     *
     * @param  {String|Array|Object} `helpers` Glob patterns or an object of helpers.
     * @return {Object}
     * @api public
     */

    loadHelpers: function(helpers) {
      var fn = app.compose({ loaderType: 'sync' }, ['helpers']);
      return fn.apply(app, arguments);
    },

    /**
     * Get a helper.
     *
     * @param {String} `name`
     * @api public
     */

    getHelper: function(name) {
      return this._.helpers.sync.getHelper(name);
    },

    /**
     * Get an async helper.
     *
     * @param {String} `name`
     * @api public
     */

    getAsyncHelper: function(name) {
      return this._.helpers.async.getHelper(name);
    },

    /**
     * Register a template helper.
     *
     * @param {String} `key` Helper name
     * @param {Function} `fn` Helper function.
     * @api public
     */

    helper: function(name, fn) {
      this._.helpers.sync.addHelper(name, fn);
      return this;
    },

    /**
     * Register multiple template helpers.
     *
     * @param {Object|Array} `helpers` Object, array of objects, or glob patterns.
     * @api public
     */

    helpers: function(helpers, options) {
      if (utils.isObject(helpers)) {
        utils.visit(this, 'helper', helpers);
        return this;
      }
      if (Array.isArray(helpers)) {
        utils.mapVisit(this, 'helper', helpers);
        return this;
      }
      if (typeof helpers === 'string') {
        // todo
      }
      return this;
    },

    /**
     * Register an async template helper.
     *
     * @param {String} `name` Helper name.
     * @param {Function} `fn` Helper function
     * @api public
     */

    asyncHelper: function(name, fn) {
      this._.helpers.async.addAsyncHelper(name, fn);
      return this;
    },

    /**
     * Register multiple async template helpers.
     *
     * @param {Object|Array} `helpers` Object, array of objects, or glob patterns.
     * @api public
     */

    asyncHelpers: function(helpers, options) {
      if (utils.isObject(helpers)) {
        utils.visit(this, 'asyncHelper', helpers);
        return this;
      }
      if (Array.isArray(helpers)) {
        utils.mapVisit(this, 'asyncHelper', helpers);
        return this;
      }
      if (typeof helpers === 'string') {
        // todo
      }
      return this;
    },

    /**
     * Register an object of helpers for the given `ext` (engine).
     *
     * @param {String} `ext` The engine to register helpers with.
     * @return {Object} Object of helpers for the specified engine.
     * @api public
     */

    engineHelpers: function(ext) {
      return app.getEngine(ext).helpers;
    }
  });
};
