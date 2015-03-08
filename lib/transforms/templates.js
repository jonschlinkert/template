'use strict';

/**
 * Register default view collections.
 */

module.exports = function (template) {
  template.create('page', { isRenderable: true });
  template.create('layout', { isLayout: true });
  template.create('partial', { isPartial: true });
};
