'use strict';

module.exports = function (app) {
  return app.visit('mixin', {

    /**
     * Find a stashed view.
     */

    lookup: function (view, collection) {
      if (typeof view === 'string') {
        if (typeof collection === 'string') {
          return this.views[collection][view];
        }

        var cached = this.stash[view];
        if (cached) return this[cached.collection].get(view);
      }
      return null;
    }
  });
};
