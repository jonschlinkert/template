'use strict';

var lazy = require('lazy-cache')(require);
var pickFrom = require('pick-from');
var cloneDeep = lazy('clone-deep');
var extend = require('extend-shallow');
var merge = require('mixin-deep');
var debug = require('../debug');
var utils = require('../utils');

/**
 * Register default view collections.
 */

module.exports = function (app) {

  /**
   * Merge all collections of the given `type` into a single
   * collection. e.g. `partials` and `includes` would be merged.
   *
   * If an array of `collections` is passed, only those collections
   * will be merged and the order in which the collections are defined
   * in the array will be respected.
   *
   * @param {String} `type` The template type to search.
   * @param {String} `subtypes` Optionally pass an array of view collection names
   * @api public
   */

  app.mixin('mergeType', function (/*type, subtypes*/) {
    var collections = this.getViewType.apply(this, arguments);
    var res = {};
    for (var key in collections) {
      var collection = collections[key];
      for (var name in collection) {
        if (!res.hasOwnProperty(name) && collection.hasOwnProperty(name)) {
          res[name] = collection[name];
        }
      }
    }
    return res;
  });

  /**
   * Merge all `layout` collections based on user-defined options.
   *
   * @param {String} `type` The template type to search.
   * @param {String} `collections` Optionally pass an array of collections
   * @api public
   */

  app.mixin('mergeLayouts', function(fn) {
    debug.template('mergeLayouts', arguments);

    var custom = this.option('mergeLayouts');
    if (typeof custom === 'undefined') custom = fn;
    var layouts = {};

    if (typeof custom === 'function') {
      return custom.call(this, arguments);
    }

    if (Array.isArray(custom)) {
      layouts = this.mergeType('layout', custom);
    } else if (custom === false) {
      layouts = this.views.layouts;
    } else {
      layouts = this.mergeType('layout');
    }

    var mergeTypeContext = this.mergeTypeContext(this, 'layouts');
    for (var key in layouts) {
      if (layouts.hasOwnProperty(key)) {
        var value = layouts[key];
        mergeTypeContext(key, value.locals, value.data);
      }
    }
    return layouts;
  });

  /**
   * Default method for determining how partials are to be passed to
   * engines.
   *
   * ```js
   * template.option('mergePartials', function(locals) {
   *   // do stuff
   * });
   * ```
   *
   * @param {Object} `locals` Locals should have layout delimiters, if defined
   * @return {Object}
   * @api public
   */

  app.mixin('mergePartials', function(context) {
    debug.template('mergePartials', arguments);

    var mergePartials = this.option('mergePartials');
    if (typeof mergePartials === 'function') {
      return mergePartials.call(this, context);
    }

    var opts = context.options || {};
    if (mergePartials === true) {
      opts.partials = cloneDeep()(context.partials || {});
    }

    var mergeTypeContext = this.mergeTypeContext(this, 'partials');
    var arr = this.viewTypes.partial;
    var len = arr.length, i = 0;

    // loop over each `partial` collection (e.g. `docs`)
    while (len--) {
      var plural = arr[i++];
      // Example `this.views.docs`
      var collection = this.views[plural];

      // Loop over each partial in the collection
      for (var key in collection) {
        if (collection.hasOwnProperty(key)) {
          var file = collection[key];

          mergeTypeContext(key, file.locals, file.data);

          // get the globally stored context that we just created
          // using `mergeTypeContext` for the current partial
          var layoutOpts = this.cache.context.partials[key];
          layoutOpts.layoutDelims = pickFrom('layoutDelims', [layoutOpts, opts]);

          // wrap the partial with a layout, if applicable
          this.applyLayout(file, layoutOpts);
          // If `mergePartials` is true combine all `partial` subtypes
          if (mergePartials === true) {
            opts.partials[key] = file.content;

          // Otherwise, each partial subtype on a separate object
          } else {
            opts[plural] = opts[plural] || {};
            opts[plural][key] = file.content;
          }
        }
      }
    }
    context.options = extend({}, context.options, opts);
    return context;
  });

  /**
   * Build the context to be passed to templates. This can be
   * overridden by passing a function to the `mergeContext`
   * option.
   *
   * ```js
   * template.option('mergeContext', function(template, locals) {
   *   return extend(template.data, template.locals, locals);
   * });
   * ```
   *
   * @param  {Object} `template` Template object
   * @param  {Object} `locals`
   * @return {Object} The object to be passed to engines/templates as context.
   */

  app.mixin('mergeContext', function(template, locals) {
    if (typeof this.option('mergeContext') === 'function') {
      return this.option('mergeContext').apply(this, arguments);
    }

    var context = {};
    merge(context, this.cache.data);
    merge(context, template.options);

    // control the order in which `locals` and `data` are extendd
    if (this.enabled('preferLocals')) {
      merge(context, template.data);
      merge(context, template.locals);
    } else {
      merge(context, template.locals);
      merge(context, template.data);
    }

    // add partials to the context to pass to engines
    merge(context, this.mergePartials(locals));

    // Merge in `locals/data` from templates
    merge(context, this.cache.context.partials);
    return context;
  });

  /**
   * Expose the current context as `this` in helpers.
   *
   *   - Exposes `locals` on the `context` property
   *   - Exposes `Template` on the `app` property
   *
   * @param  {Object} `options` Additional options that may contain helpers
   * @param  {Object} `context` Used as the context to bind to helpers
   * @param  {Boolean} `isAsync` Pass `true` if the helper is async.
   * @return {Object}
   */

  app.mixin('bindHelpers', function (options, context, isAsync) {
    debug.helper('binding helpers: %j %j', context, options);

    var helpers = {};
    extend(helpers, this.options.helpers);
    extend(helpers, this._.helpers.sync);

    if (isAsync) {
      extend(helpers, this._.helpers.async);
    }
    extend(helpers, options.helpers);

    // build the context to be exposed as `this` in helpers
    var ctx = {};
    var opts = extend({}, this.options, this.option('helper'));
    ctx.options = extend({}, opts, options);
    ctx.context = context || {};
    ctx.app = this;

    options.helpers = utils.bindAll(helpers, ctx);
  });

  /**
   * Build the context for a specific template and type.
   *
   * ```js
   * template.mergeTypeContext('partials', 'sidenav', locals, data);
   * ```
   *
   * @param  {String} `type` Template type to merge
   * @param  {String} `key` Key of template to use
   * @param  {Object} `locals` Locals object from template
   * @param  {Object} `data` Data object from template
   * @api private
   */

  app.mixin('mergeTypeContext', function (app, type) {
    return function(key, locals, data) {
      app.cache.context[type] = app.cache.context[type] || {};
      app.cache.context[type][key] = extend({}, locals, data);
    };
  });
};
