'use strict';

var extend = require('extend-shallow');
var utils = require('./utils');

module.exports = function (app) {

  /**
   * Create helpers for each default template `type`.
   *
   * @param {String} `type` The type of template.
   * @param {String} `plural` Plural form of `type`.
   * @api private
   */

  defaultHelper: function(collectionName, plural) {
    app.helper(collectionName, function (key, locals) {
      var template = app.getView(plural, key);
      if (!template) {
        app.error('defaultHelper', 'cannot find: ' + key);
        return '';
      }
      locals = locals || {};
      var context = extend({}, this.context, locals, locals.hash);
      var content = template.render(context);
      if (content instanceof Error) {
        throw content;
      }
      return content;
    });
  },

  /**
   * Create async helpers for each default template `type`.
   *
   * @param {String} `type` The type of template.
   * @param {String} `plural` Plural form of `type`.
   * @api private
   */

  defaultAsyncHelper: function(collectionName, plural) {
    app.asyncHelper(collectionName, function (key, locals, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      options = options || {};
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

      var context = extend({}, this.context, locals, options.hash);
      template.render(context, function (err, content) {
        if (err) return cb(err);
        cb(null, content);
        return;
      });
    });
  }
};
