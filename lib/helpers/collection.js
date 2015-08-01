'use strict';

var utils = require('../utils');

module.exports = function (app, collection, options) {
  var plural = options.plural;
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
    cb = args.pop();

    try {
      var view = app.lookup(key, plural);
      if (!Object.keys(view).length) {
        view = collection[key];
      }

      if (!view || !Object.keys(view).length) {
        app.emit('error', 'missing ' + single + ' `' + key + '`');
        return cb(null, '');
      }

      var locs = utils.getLocals.apply(utils.getLocals, args);
      locs = locs || {};
      view.ctx('helper', locs);

      view.render(locs, function (err, res) {
        if (err) return cb(err);
        return cb(null, res.content);
      });

    } catch(err) {
      app.emit('error', 'in helper: ' + single + ': ' + key, err);
      cb(null, '');
    }
  });
};
