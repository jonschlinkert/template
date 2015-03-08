'use strict';

var frontMatter = require('../middleware/matter');
var utils = require('../');

/**
 * Load default routes / middleware
 */

module.exports = function (template) {
  if (!template.context('default routes')) {
    return;
  }

  // get extensions from engines
  var extensions = Object.keys(template.engines);

  // use extensions to create the route
  var re = utils.extensionRe(extensions);

  // load front matter middleware
  template.onLoad(re, frontMatter);
}
