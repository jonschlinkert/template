'use strict';

var path = require('path');
var has = require('has-value');
var utils = require('../');

/**
 * Populate `file.options.engine` with the engine to use.
 */

module.exports = function engine_(template) {
  return function(file, next) {
    if (file.noengine || template.option('noengine')) {
      file.engine = null;
      return next();
    }
    // file.engine => file.options.engine
    if (file.engine) {
      file.engine = utils.formatExt(file.engine);
      return next();
    }
    // file.options.create.engine => file.options.engine
    if (has(file, 'options.create.engine')) {
      file.engine = utils.formatExt(file.options.create.engine);
      return next();
    }
    if (has(file, 'options.engine')) {
      file.engine = utils.formatExt(file.options.engine);
      return next();
    }
    // file.locals.engine => file.options.engine
    if (has(file, 'locals.engine')) {
      file.engine = utils.formatExt(file.locals.engine);
      return next();
    }
    // file.ext => file.options.engine
    if (file.ext) {
      file.engine = file.ext;
      return next();
    }
    // file.options.ext => file.options.engine
    if (has(file, 'options.ext')) {
      file.engine = file.options.ext;
      return next();
    }
    // file.locals.ext => file.options.engine
    if (has(file, 'locals.ext')) {
      file.engine = file.locals.ext;
      return next();
    }
    // file.ext => file.options.engine
    if (file.path) {
      var ext = path.extname(file.path);
      if (ext) file.engine = ext;
      return next();
    }
    var engine = template.option('view engine');
    file.engine = utils.formatExt(engine);
    next();
  };
};
