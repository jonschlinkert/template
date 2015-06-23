'use strict';

var Engines = require('engine-cache');
var utils = require('./utils');


module.exports = function (app) {

  app.engines = {};
  app._.engines = new Engines(app.engines);

  return app.visit('mixin', {

    /**
     * Register the given view engine callback `fn` as `ext`.
     *
     * @param {String|Array} `exts` File extension or array of extensions.
     * @param {Function|Object} `fn` or `options`
     * @param {Object} `options`
     * @api public
     */

    engine: function(exts, fn, options) {
      if (arguments.length === 1 && typeof exts === 'string') {
        return this.getEngine(exts);
      }
      exts = utils.arrayify(exts);
      var len = exts.length;
      while (len--) {
        var ext = exts[len];
        if (ext && ext[0] !== '.') ext = '.' + ext;
        this._.engines.setEngine(ext, fn, options);
      }
      return this;
    },

    /**
     * Get the engine settings registered for the given `ext`.
     *
     * @param {String} `ext` The engine to get.
     * @api public
     */

    getEngine: function(ext) {
      ext = ext || this.option('view engine');
      if (ext && ext[0] !== '.') ext = '.' + ext;
      return this._.engines.getEngine(ext);
    }
  });
};
