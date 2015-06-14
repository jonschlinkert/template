'use strict';

var extend = require('extend-shallow');

/**
 * Convience methods for finding templates.
 */

module.exports = function (app) {

  /**
   * Get a view `collection` by its singular or plural name.
   *
   * ```js
   * var pages = template.getViews('pages');
   * //=> { pages: {'home.hbs': { ... }}
   *
   * var posts = template.getViews('posts');
   * //=> { posts: {'2015-10-10.md': { ... }}
   * ```
   *
   * @param {String} `name` Collection name.
   * @return {Object}
   * @api public
   */

  app.mixin('getViews', function(plural) {
    if (!this.views.hasOwnProperty(plural)) {
      plural = this.inflections[plural];
    }
    return this.views[plural];
  });

  /**
   * Get a specific template from the specified collection.
   *
   * @param {String} `name` Template name
   * @param {String} `collection` Collection name
   * @return {Object}
   * @api public
   */

  app.mixin('getView', function(collection, name) {
    if (!name) return this.error('getView', 'expects a template name.');
    var views = this.getViews(collection);
    if (!views) {
      throw this.error('getView', 'can\'t find collection', arguments);
    }
    if (views.hasOwnProperty(name)) {
      return views[name];
    }
    var fn = this.option('renameKey');
    if (typeof fn === 'function') {
      name = fn(name);
    }
    if (views.hasOwnProperty(name)) {
      return views[name];
    }
    if (this.enabled('strict errors')) {
      throw this.error('getView', 'can\'t find view', arguments);
    }
    return '';
  });

  /**
   * Convenience method for finding a specific template by `name` on
   * the given collection. Optionally specify a file extension.
   *
   * @param {String} `plural` The view collection to search.
   * @param {String} `name` The name of the template.
   * @param {String} `ext` Optionally pass a file extension to append to `name`
   * @api public
   */

  app.mixin('lookup', function(collection, name, ext) {
    var views = this.getViews(collection || 'pages');
    if (views.hasOwnProperty(name)) {
      return views[name];
    }

    var idx = name.indexOf('.');
    var hasExt = idx !== -1;

    var base = hasExt ? name.slice(0, idx) : name;
    if (hasExt && views.hasOwnProperty(base)) {
      return views[base];
    }

    var key = name + (ext || '.md');
    if (views.hasOwnProperty(key)) {
      return views[key];
    }

    var fn = this.option('renameKey');
    if (typeof fn === 'function') {
      name = fn(name);
    }

    if (views.hasOwnProperty(key)) {
      return views[key];
    }

    if (this.enabled('strict errors')) {
      throw this.error('lookup', 'can\'t find view', arguments);
    }
    return null;
  });

  /**
   * Find a template based on its `viewType`. `.find` returns the first
   * template that matches the given `key`.
   *
   * Searches all views of [view-subtypes][subtypes] of the given [viewType], returning
   * the first template found with the given `key`. Optionally pass
   * an array of `collections` to limit the search;
   *
   * ```js
   * template.find('renderable', 'home', ['page', 'post']);
   * ```
   *
   * @param {String} `viewType` The template viewType to search.
   * @param {String} `key` The key of the template to find.
   * @param {Array} `subtypes`
   * @api public
   */

  app.mixin('find', function(viewType, name, subtypes) {
    if (typeof viewType !== 'string') {
      throw this.error('find', 'expects `viewType` to be a string', arguments);
    }
    if (typeof name !== 'string') {
      throw this.error('find', 'expects `name` to be a string', arguments);
    }
    var collection = this.getViewType(viewType, subtypes);
    for (var key in collection) {
      var views = collection[key];
      if (views.hasOwnProperty(name)) {
        return views[name];
      }
    }
    // nothing was found, maybe keep looking?
    return null;
  });

  /**
   * Search all renderable `subtypes`, returning the first template
   * with the given `key`.
   *
   *   - If `key` is not found `null` is returned
   *   - Optionally limit the search to the specified `subtypes`.
   *
   * @param {String} `key` The template to search for.
   * @param {Array} `subtypes`
   * @api public
   */

  app.mixin('findRenderable', function(key, subtypes) {
    return this.find('renderable', key, subtypes);
  });

  /**
   * Search all layout `subtypes`, returning the first template
   * with the given `key`.
   *
   *   - If `key` is not found `null` is returned
   *   - Optionally limit the search to the specified `subtypes`.
   *
   * @param {String} `key` The template to search for.
   * @param {Array} `subtypes`
   * @api public
   */

  app.mixin('findLayout', function(key, subtypes) {
    return this.find('layout', key, subtypes);
  });

  /**
   * Search all partial `subtypes`, returning the first template
   * with the given `key`.
   *
   *   - If `key` is not found `null` is returned
   *   - Optionally limit the search to the specified `subtypes`.
   *
   * @param {String} `key` The template to search for.
   * @param {Array} `subtypes`
   * @api public
   */

  app.mixin('findPartial', function(key, subtypes) {
    return this.find('partial', key, subtypes);
  });
};
