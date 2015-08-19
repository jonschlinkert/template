'use strict';

var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('clone-deep', 'clone');
lazy('recent');

module.exports = function (view) {
  view.visit('mixin', {

    /**
     * Return the most recent items from a collection. By default, one of
     * the following properties will be used for sorting, and in the order
     * specified: `key`, `path`, or `data.date`.
     *
     * @param  {String} `prop` The property to sort by.
     * @param  {String|Object|Array|Function} `pattern` Function, glob patterns, object, array, or string pattern to use for pre-filtering files.
     * @param  {Object} `options` Options to pass to [micromatch] if glob patterns are used.
     * @return {Object}
     */

    recent: function(prop, pattern, options) {
      var List = this.get('List');
      var opts = lazy.clone(this.options);
      var res = new List(opts);

      options = options || {};
      options.prop = options.prop || prop;

      var obj = {};
      var views = this.items;
      for (var key in views) {
        obj[key] = this[key];
        obj[key].key = key;
      }

      var rec = lazy.recent(obj, options);
      res.visit('item', rec);
      return res;
    }
  });
};
