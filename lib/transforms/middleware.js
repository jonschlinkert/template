'use strict';

var middleware = require('../middleware/');
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

  template.onLoad(/./, middleware.props);
  template.onLoad(/./, middleware.ext);
  template.onLoad(/./, middleware.layout);
  template.onLoad(re, middleware.matter);
  template.preRender(/./, middleware.engine(template));
};
