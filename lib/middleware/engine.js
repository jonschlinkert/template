'use strict';

var path = require('path');
var utils = require('../utils');

/**
 * Set the engine to use on `file.options.engine`:
 *   | option('view engine')
 *   | file.engine
 *   | file.options.engine
 *   | file.locals.engine
 *   | path.extname(fp)
 */

module.exports = function(app) {
  return function(file, next) {
    if (file.noengine || app.option('noengine')) {
      file.engine = null;
      return next();
    }

    var opts = file.options || {};
    var locs = file.locals || {};

    var viewEngine = app.option('view engine');

    // file.engine => '.foo' (1 failed)
    if (viewEngine && viewEngine !== '*' && viewEngine !== '.*') {
      file.engine = utils.formatExt(viewEngine);
      app.option('view engine', file.engine);
      return next();
    }

    // file.engine => '.foo' (5 failed)
    if (file.engine) {
      file.engine = utils.formatExt(file.engine);
      return next();
    }

    // file.options.engine => '.foo' (11 failed)
    if (opts.engine) {
      file.engine = opts.engine;
      return next();
    }

    // file.locals.engine => '.foo' (11 failed)
    if (locs.engine) {
      file.engine = locs.engine;
      return next();
    }

    // path.extname(fp) => '.foo' (60+ failed)
    var engine = path.extname(file.path);
    if (engine) {
      file.engine = engine;
      return next();
    }
    next();
  };
};
