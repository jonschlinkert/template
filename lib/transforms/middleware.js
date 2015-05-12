'use strict';

var mu = require('middleware-utils');
var tu = require('template-utils').utils;
var middleware = require('../middleware/');
var regex;

/**
 * Load default routes / middleware
 */

module.exports = function (app) {
  if (!app.option('default routes')) return;

  // use extensions from engines to create route regex
  if (typeof regex === 'undefined') {
    regex = tu.extensionRe(Object.keys(app.engines));
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
    .postCompile(/./, mu.series([
      middleware.layoutContext
    ]))
    .use(/./, mu.series([
      middleware.engine(app)
    ]));
};
