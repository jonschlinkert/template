'use strict';

var path = require('path');
var has = require('has-value');
var utils = require('template-utils')._;

/**
 * Set the engine to use on `file.options.engine`:
 *
 *   | file.engine
 *   | file.options.create.engine
 *   | file.options.engine
 *   | file.locals.engine
 *   | file.ext
 *   | file.options.ext
 *   | path.extname(fp)
 *   | file.locals.ext
 *   | option('view engine')
 */

module.exports = function(app) {
  return function(file, next) {
    if (file.noengine || app.option('noengine')) {
      file.engine = null;
      return next();
    }

    var viewEngine = app.option('view engine');

    // file.engine => '.foo'
    if (viewEngine && viewEngine !== '*' && viewEngine !== '.*') {
      viewEngine = app.options['view engine'] = utils.formatExt(viewEngine);
      file.engine = utils.formatExt(viewEngine);
      return next();
    }

    // file.engine => '.foo'
    if (file.engine) {
      file.engine = utils.formatExt(file.engine);
      return next();
    }
    // file.options.create.engine => '.foo'
    if (has(file, 'options.create.engine')) {
      file.options.create.engine = utils.formatExt(file.options.create.engine);
      file.engine = file.options.create.engine;
      return next();
    }
    // file.options.engine => '.foo'
    if (has(file, 'options.engine')) {
      file.options.engine = utils.formatExt(file.options.engine);
      file.engine = file.options.engine;
      return next();
    }
    // file.locals.engine => '.foo'
    if (has(file, 'locals.engine')) {
      file.locals.engine = utils.formatExt(file.locals.engine);
      file.engine = file.locals.engine;
      return next();
    }
    // file.ext => '.foo'
    if (file.ext) {
      file.ext = utils.formatExt(file.ext);
      file.engine = file.ext;
      return next();
    }
    // file.options.ext => '.foo'
    if (has(file, 'options.ext')) {
      file.options.ext = utils.formatExt(file.options.ext);
      file.engine = file.options.ext;
      return next();
    }
    // path.extname(fp) => '.foo'
    var ext = path.extname(file.path);
    if (ext) {
      file.engine = ext;
      return next();
    }

    // file.locals.ext => '.foo'
    if (has(file, 'locals.ext')) {
      file.locals.ext = utils.formatExt(file.locals.ext);
      file.engine = file.locals.ext;
      return next();
    }

    file.engine = utils.formatExt(viewEngine);
    next();
  };
};
