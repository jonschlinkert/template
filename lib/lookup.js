'use strict';

var utils = require('./utils');
var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('is-extendable', 'isObject');

module.exports = function (app) {
  app.visit('mixin', {

    /**
     * Returns the first template from the given collection with a key
     * that matches the given glob pattern.
     *
     * ```js
     * var pages = app.matchView('pages', 'home.*');
     * //=> {'home.hbs': { ... }, ...}
     *
     * var posts = app.matchView('posts', '2010-*');
     * //=> {'2015-10-10.md': { ... }, ...}
     * ```
     *
     * @param {String} `collection` Collection name.
     * @param {String} `pattern` glob pattern
     * @param {Object} `options` options to pass to [micromatch]
     * @return {Object}
     * @api public
     */

    matchView: function(collection, pattern, options) {
      var views = this.getViews(collection);
      if (views.hasOwnProperty(pattern)) {
        return views[pattern];
      }
      return utils.matchKey(views, pattern, options);
    },

    /**
     * Returns any templates from the specified collection with keys
     * that match the given glob pattern.
     *
     * ```js
     * var pages = app.matchViews('pages', 'home.*');
     * //=> {'home.hbs': { ... }, ...}
     *
     * var posts = app.matchViews('posts', '2010-*');
     * //=> {'2015-10-10.md': { ... }, ...}
     * ```
     *
     * @param {String} `collection` Collection name.
     * @param {String} `pattern` glob pattern
     * @param {Object} `options` options to pass to [micromatch]
     * @return {Object}
     * @api public
     */

    matchViews: function(collection, pattern, options) {
      var views = this.getViews(collection);
      return utils.matchKeys(views, pattern, options);
    },

    /**
     * Get a specific template from the specified collection.
     *
     * ```js
     * app.getView('pages', 'a.hbs', function(fp) {
     *   return path.basename(fp);
     * });
     * ```
     *
     * @param {String} `collectionName` Collection name, like `pages`
     * @param {String} `key` Template name
     * @param {Function} `fn` Optionally pass a `renameKey` function
     * @return {Object}
     * @api public
     */

    getView: function(collection, key, fn) {
      var views = this.getViews(collection);
      // if a custom renameKey function is passed, try using it
      if (typeof fn === 'function') {
        key = fn(key);
      }
      if (views.hasOwnProperty(key)) {
        return views[key];
      }
      // try again with the default renameKey function
      fn = this.option('renameKey');
      var name;
      if (typeof fn === 'function') {
        name = fn(key);
      }
      if (name && name !== key && views.hasOwnProperty(name)) {
        return views[name];
      }
      return null;
    },

    /**
     * Get a view `collection` by its singular or plural name.
     *
     * ```js
     * var pages = app.getViews('pages');
     * //=> { pages: {'home.hbs': { ... }}
     *
     * var posts = app.getViews('posts');
     * //=> { posts: {'2015-10-10.md': { ... }}
     * ```
     *
     * @param {String} `plural` The plural collection name, e.g. `pages`
     * @return {Object}
     * @api public
     */

    getViews: function(plural) {
      if (lazy.isObject(plural)) return plural;
      if (!this.views.hasOwnProperty(plural)) {
        plural = this.inflections[plural];
      }
      if (!this.views.hasOwnProperty(plural)) {
        throw new Error('getViews cannot find collection' + plural);
      }
      return this.views[plural];
    },

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
