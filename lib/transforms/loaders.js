'use strict';

var loaders = require('../loaders');
var utils = require('../');

/**
 * Mix loader methods onto `Template`, then
 * register default loaders
 */

module.exports = function (template) {
  var mix = utils.mixInLoaders(template, template._.loaders);

  // register methods
  mix('loader', 'register');
  mix('loaderAsync', 'registerAsync');
  mix('loaderPromise', 'registerPromise');
  mix('loaderStream', 'registerStream');

  // load methods
  mix('load');
  mix('loadAsync');
  mix('loadPromise');
  mix('loadStream');

  /**
   * Actually load default loaders
   */

  template.loader('default', loaders.templates(template));
  template.loader('helpers', loaders.helpers(template));
};
