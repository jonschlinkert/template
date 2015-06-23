'use strict';

var util = require('util');
var path = require('path');
var extend = require('extend-shallow');
var Collection = require('./collection');
var utils = require('./utils');
var View = require('./view');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views(/*options, loaders, app*/) {
  Collection.apply(this, arguments);
}

util.inherits(Views, Collection);

/**
 * Views prototype methods
 */

utils.defineProps(Views.prototype, {

  /**
   * Set a view.
   */

  set: function (key, value) {
    this[key] = new View(value, this, this.app);
    return this;
  },

  /**
   * Set view types for the collection.
   *
   * @param {String} `plural` e.g. `pages`
   * @param {Object} `options`
   * @api private
   */

  viewType: function() {
    this.options.viewType = this.options.viewType || 'renderable';
    return utils.arrayify(this.options.viewType);
  },

  /**
   * Rename template keys.
   */

  renameKey: function (fp, options) {
    var opts = extend({}, this.options, options);
    var fn = opts.renameKey || path.basename;
    return fn(fp);
  },

  /**
   * Create helpers for each default template `type`.
   *
   * @param {String} `type` The type of template.
   * @param {String} `plural` Plural form of `type`.
   * @api private
   */

  // defaultHelper: function(collectionName, plural) {
  //   app.helper(collectionName, function (key, locals) {
  //     var template = app.getView(plural, key);
  //     if (!template) {
  //       app.error('defaultHelper', 'cannot find: ' + key);
  //       return '';
  //     }
  //     locals = locals || {};
  //     var context = extend({}, this.context, locals, locals.hash);
  //     var content = template.render(context);
  //     if (content instanceof Error) {
  //       throw content;
  //     }
  //     return content;
  //   });
  // },

  // /**
  //  * Create async helpers for each default template `type`.
  //  *
  //  * @param {String} `type` The type of template.
  //  * @param {String} `plural` Plural form of `type`.
  //  * @api private
  //  */

  // defaultAsyncHelper: function(collectionName, plural) {
  //   app.asyncHelper(collectionName, function (key, locals, options, cb) {
  //     if (typeof options === 'function') {
  //       cb = options;
  //       options = {};
  //     }

  //     options = options || {};
  //     var template = this.app.getView(plural, key);
  //     var args = [].slice.call(arguments, 1);
  //     cb = args.pop();

  //     if (!template) {
  //       this.app.error('defaultAsyncHelper:', 'cannot find template: ' + key);
  //       return cb(null, '');
  //     }

  //     if (args.length === 0) {
  //       locals = {};
  //     }

  //     var context = extend({}, this.context, locals, options.hash);
  //     template.render(context, function (err, content) {
  //       if (err) return cb(err);
  //       cb(null, content);
  //       return;
  //     });
  //   });
  // }
});

/**
 * Expose `Views`
 */

module.exports = Views;
