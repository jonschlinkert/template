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
  app.onLoad(/./, mutil.series([
      middleware.props,
      middleware.options,
      middleware.ext(app),
      middleware.decorate(app),
      middleware.layout,
    ]))

    .use(/./, mutil.series([
      middleware.engine(app)
    ]))
};
