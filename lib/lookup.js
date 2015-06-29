'use strict';

module.exports = function (app) {
  app.visit('mixin', {

    /**
     * Find a stashed view.
     */

    lookup: function (view, collection) {
      if (typeof view === 'string') {

        if (typeof collection === 'string') {
          return this[collection].get(view);
        }
        var collections = this.viewTypes.renderable;
        var len = collections.length, i = 0;
        while (len--) {
          var plural = collections[i++];
          var views = this.views[plural];
          var res;
          if (res = views[view]) {
            return res;
          }
        }
      }
      return null;
    }
  });
};
