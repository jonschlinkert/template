'use strict';

var utils = require('../utils');

module.exports = function (app, collection, options) {
  var plural = options.collection;
  var single = options.inflection;

  /**
   * Create async helpers for each default template `type`.
   *
   * @param {String} `type` The type of template.
   * @param {String} `plural` Plural form of `type`.
   * @api private
   */

  app.asyncHelper(single, function (key, locals, opts, cb) {
    var args = [].slice.call(arguments, 1);
    var cb = args.pop();

    var view = app.lookup(key, plural);
    if (!view) {
      app.emit('error', 'missing view: ' + plural + ' > ' + key);
      return cb(null, '');
    }

    var locs = utils.getLocals.apply(utils.getLocals, args);
    view.ctx('helper', locs);

    view.render(locs, function (err, res) {
      if (err) return cb(err);
      return cb(null, res.content);
    });
  });
};
