'use strict';

var lazy = require('lazy-cache')(require);
var lazyLayouts = lazy('layouts');
var extend = require('extend-shallow');
var typeOf = require('kind-of');
var debug = require('../debug');
var utils = require('../utils');

/**
 * Register default view collections.
 */

module.exports = function (app) {

  /**
   * If a layout is defined, apply it. Otherwise just return the content as-is.
   *
   * @param  {String} `ext` The layout settings to use.
   * @param  {Object} `template` Template object, with `content` to be wrapped with a layout.
   * @return  {String} Either the string wrapped with a layout, or the original string if no layout was found.
   * @api private
   */

  app.mixin('applyLayout', function(template, locals) {
    debug.layout('applyLayout', arguments);

    if (typeOf(template) !== 'object') {
      throw this.error('applyLayout', 'expects an object', arguments);
    }

    // return if a layout has already been applied
    if (template.options.layoutApplied) {
      return template;
    }

    var opts = this.session && this.session.get('src') || {};
    var config = extend({}, template, locals, opts);

    template.options.layoutApplied = true;
    var type = template.options.viewType;
    if (type && utils.arrayify(type).indexOf('partial') !== -1) {
      config.defaultLayout = false;
    }

    // Get the name of the (starting) layout to be used
    var layout = config.layout
      || config.locals && config.locals.layout
      || config.data && config.data.layout
      || config.options && config.options.layout;

    // If `layoutExt` is defined on the options, append
    // it to the layout name before passing the name to [layouts]
    var ext = this.option('layoutExt');
    if (typeof ext === 'string') {
      layout += utils.formatExt(ext);
    }

    var layouts = lazyLayouts();
    // Merge `layout` collections based on settings
    var stack = this.mergeLayouts(config);
    var res = layouts(template.content, layout, stack, config);
    if (res.options && res.options.options) {
      extend(res.options, res.options.options);
      delete res.options.options;
    }

    // add the results to the `layoutStack` property of a template
    template.options.layoutStack = res;

    // update the template content to be the
    template.content = res.result;
    return template;
  });
};
