'use strict';

var utils = require('../');

/**
 * Populate `file.options.engine` with the engine to use.
 */

module.exports = function engine_(template) {
  return function(file, next) {
    if (file.options.engine) {
      file.options.engine = utils.formatExt(file.options.engine);
      return next();
    }
    // file.locals.engine => file.options.engine
    if (file.locals.engine) {
      file.options.engine = utils.formatExt(file.locals.engine);
      file.locals.engine = null;
      delete file.locals.engine;
      return next();
    }
    // file.engine => file.options.engine
    if (file.engine) {
      file.options.engine = utils.formatExt(file.engine);
      file.engine = null;
      delete file.engine;
      return next();
    }
    // file.ext => file.options.engine
    if (file.ext) {
      file.options.engine = file.ext;
      return next();
    }

    var engine = template.option('view engine');
    file.options.engine = utils.formatExt(engine);
    next();
  };
};
