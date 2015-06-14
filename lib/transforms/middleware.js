'use strict';

var mu = require('middleware-utils');
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

  app.onLoad(regex, mu.series([
      middleware.validate(app),
      middleware.matter(app),
    ]), mu.error('onLoad (matter)'))

    .onLoad(/./, mu.series([
      middleware.props,
      middleware.options,
      middleware.ext(app),
      middleware.decorate(app),
      middleware.layout,
      middleware.layouts(app),
    ]), mu.error('onLoad'))

    .onRender(/./, mu.series([
      middleware.decorate(app)
    ]), mu.error('onRender'))

    .preCompile(/./, mu.series([
      middleware.engine(app)
    ]), mu.error('postCompile'))

    .postCompile(/./, mu.series([
      middleware.layoutContext
    ]), mu.error('postCompile'))

    .all(/./, mu.series([
      function (file, next) {
        // file.data = {foo: 'bar'}
        next();
      },
      middleware.engine(app)
    ]), mu.error('use'));
};
