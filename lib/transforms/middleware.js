'use strict';

var lazy = require('lazy-cache')(require);
var lazyUtils = lazy('middleware-utils');
var middleware = require('../middleware/');
var utils = require('../utils');
var regex;

/**
 * Load default routes / middleware
 */

module.exports = function (app) {
  /* deps: middleware-utils */
  if (app.isFalse('default routes')) return;

  // use extensions from engines to create route regex
  if (typeof regex === 'undefined') {
    regex = utils.extensionRe(Object.keys(app.engines));
  }

  var mu = lazyUtils();
  app.onLoad(regex, mu.series([
      middleware.file,
      middleware.validate(app),
      middleware.matter(app),
    ]), mu.error('onLoad (matter)'))

    .onLoad(/./, mu.series([
      middleware.props,
      middleware.options,
      middleware.layout,
      middleware.layouts(app),
    ]), mu.error('onLoad'))

    .preCompile(regex, mu.series([
      middleware.engine(app)
    ]), mu.error('postCompile'))

    .postCompile(regex, mu.series([
      middleware.layoutContext
    ]), mu.error('postCompile'))

    .all(regex, mu.series([
      middleware.engine(app)
    ]), mu.error('use'));
};
