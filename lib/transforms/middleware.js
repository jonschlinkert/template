'use strict';

var mu = require('middleware-utils');
var middleware = require('../middleware/');
var utils = require('../');
var regex;

/**
 * Load default routes / middleware
 */

module.exports = function (app) {
  if (!app.option('default routes')) return;

  // use extensions from engines to create route regex
  if (typeof regex === 'undefined') {
    regex = utils.extensionRe(Object.keys(app.engines));
  }

  app.onLoad(regex, mu.series([
      middleware.matter(app),
    ]))
    .onLoad(/./, mu.series([
      middleware.props,
      middleware.options,
      middleware.ext(app),
      middleware.decorate(app),
      middleware.layouts(app),
      middleware.layout,
    ]))
    .onRender(/./, mu.series([
      middleware.decorate(app)
    ]))
    .postCompile(/./, mu.series([
      middleware.layoutContext
    ]))
    .use(/./, mu.series([
      middleware.engine(app)
    ]));
};
