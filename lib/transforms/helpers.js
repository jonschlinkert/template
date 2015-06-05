'use strict';

var extend = require('extend-shallow');

/**
 * Register default view collections.
 */

module.exports = function (app) {

  /**
   * Create helpers for each default template `type`.
   *
   * @param {String} `type` The type of template.
   * @param {String} `plural` Plural form of `type`.
   * @api private
   */

  app.defaultHelper = function(subtype, plural) {
    app.helper(subtype, function (key, locals) {
      var template = app.getView(plural, key);
      if (!template) {
        app.error('defaultHelper', 'cannot find: ' + key);
        return '';
      }
      var context = extend({}, this.context, locals);
      var content = template.render(context);
      if (content instanceof Error) {
        throw content;
      }
      return content;
    });
  };

  /**
   * Create async helpers for each default template `type`.
   *
   * @param {String} `type` The type of template.
   * @param {String} `plural` Plural form of `type`.
   * @api private
   */

  app.defaultAsyncHelper = function(subtype, plural) {
    app.asyncHelper(subtype, function (key, locals, options, cb) {
      var template = this.app.getView(plural, key);
      var args = [].slice.call(arguments, 1);
      cb = args.pop();

      if (!template) {
        this.app.error('defaultAsyncHelper:', 'cannot find template: ' + key);
        return cb(null, '');
      }

      if (args.length === 0) {
        locals = {};
      }
      var context = extend({}, this.context, locals);
      template.render(context, function (err, content) {
        if (err) return cb(err);
        cb(null, content);
        return;
      });
    });
  };
};
