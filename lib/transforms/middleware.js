'use strict';

var mutil = require('middleware-utils');
var extend = require('extend-shallow');
var middleware = require('../middleware/');
var series = require('../series');
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

  app.onLoad(regex, mutil.series([
      middleware.matter(app),
    ]))
    .onLoad(/./, mutil.series([
      middleware.props,
      middleware.options,
      middleware.ext(app),
      middleware.decorate(app),
      middleware.layouts(app),
      middleware.layout,
    ]))
    .postCompile(/./, mutil.series([
      middleware.layoutContext
    ]))
    .use(/./, mutil.series([
      middleware.engine(app)
    ]))
};
