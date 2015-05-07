'use strict';

var mutil = require('middleware-utils');
var middleware = require('../middleware/');
var series = require('../series');
var utils = require('../');
var regex;

/**
 * Load default routes / middleware
 */

module.exports = function (app) {
  if (!app.option('default routes')) {
    return;
  }

  // use extensions from engines to create route regex
  if (typeof regex === 'undefined') {
    regex = utils.extensionRe(Object.keys(app.engines));
  }

  app.onLoad(regex, middleware.matter(app));
  app.onLoad(/./, mutil.parallel([
    middleware.props,
    middleware.options,
    middleware.decorate(app),
    middleware.layout,
    middleware.ext,
  ]));

  app.preRender(/./, middleware.engine(app));
};
