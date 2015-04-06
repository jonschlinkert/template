'use strict';

var middleware = require('../middleware/');
var series = require('../series');
var utils = require('../');

/**
 * Load default routes / middleware
 */

module.exports = function (template) {
  if (!template.option('default routes')) {
    return;
  }

  // get extensions from engines
  var extensions = Object.keys(template.engines);
  // use extensions to create the route
  var re = utils.extensionRe(extensions);

  template.use(/./, series([
    middleware.options,
  ]));

  template.onLoad(re, middleware.matter);
  template.onLoad(/./, series([
    middleware.props,
    middleware.matter,
    middleware.layout,
    middleware.ext,
  ]));

  template.preRender(/./, series([
    middleware.engine(template)
  ]));
};
