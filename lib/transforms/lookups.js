'use strict';

var path = require('path');
var isGlob = require('is-glob');
var utils = require('../utils');

/**
 * Convience methods for finding templates.
 */

module.exports = function (app) {

  /**
   * Returns the first template from the given collection with a key
   * that matches the given glob pattern.
   *
   * ```js
   * var pages = template.matchView('pages', 'home.*');
   * //=> {'home.hbs': { ... }, ...}
   *
   * var posts = template.matchView('posts', '2010-*');
   * //=> {'2015-10-10.md': { ... }, ...}
   * ```
   *
   * @param {String} `collection` Collection name.
   * @param {String} `pattern` glob pattern
   * @param {Object} `options` options to pass to [micromatch]
   * @return {Object}
   * @api public
   */

  app.mixin('matchView', function(collection, pattern, options) {
    var views = this.getViews(collection);
    if (views.hasOwnProperty(pattern)) {
      return views[pattern];
    }
    return utils.matchKey(views, pattern, options);
  });

  /**
   * Returns any templates from the specified collection with keys
   * that match the given glob pattern.
   *
   * ```js
   * var pages = template.matchViews('pages', 'home.*');
   * //=> {'home.hbs': { ... }, ...}
   *
   * var posts = template.matchViews('posts', '2010-*');
   * //=> {'2015-10-10.md': { ... }, ...}
   * ```
   *
   * @param {String} `collection` Collection name.
   * @param {String} `pattern` glob pattern
   * @param {Object} `options` options to pass to [micromatch]
   * @return {Object}
   * @api public
   */

  app.mixin('matchViews', function(collection, pattern, options) {
    var views = this.getViews(collection);
    return utils.matchKeys(views, pattern, options);
  });

  /**
   * Get a specific template from the specified collection.
   *
   * @param {String} `collectionName` Collection name, like `pages`
   * @param {String} `key` Template name
   * @param {Function} `fn` Optionally pass a `renameKey` function
   * @return {Object}
   * @api public
   */

  app.mixin('getView', function(collection, key, fn) {
    this.assert('getView', 'key', 'string', key);
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
  });

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
   * @param {String} `plural` The plural collection name, e.g. `pages`
   * @return {Object}
   * @api public
   */

  app.mixin('getViews', function(plural) {
    if (utils.isObject(plural)) return plural;
    if (!this.views.hasOwnProperty(plural)) {
      plural = this.inflections[plural];
    }
    if (!this.views.hasOwnProperty(plural)) {
      throw this.error('getViews', 'cannot find collection' + plural);
    }
    return this.views[plural];
  });

  /**
   * Uses `getView` but does two additional searches if the template is not found:
   *
   *   - tries looking for the template using basename only
   *   - Optionally specify a file extension.
   *
   * @param {String} `plural` The view collection to search.
   * @param {String} `name` The name of the template.
   * @param {String} `ext` Optionally pass a file extension to append to `name`
   * @param {String} `fn` Optionally pass a `renameKey` function
   * @api public
   */

  app.mixin('lookup', function(collectionName, name, ext, fn) {
    var views = this.getViews(collectionName);
    var match = null;

    if (typeof ext === 'function') {
      fn = ext;
      ext = null;
    }
    if (typeof ext === 'string') {
      name = name + ext;
    }

    // if the pattern is a glob try to find a match
    if (isGlob(name) || Array.isArray(name)) {
      return this.matchView(views, name);
    }
    // if `options.lookupExts` is defined, use it first
    var exts = this.option('lookupExts');
    if (exts) {
      exts = utils.extsPattern(utils.arrayify(exts));
      match = this.matchView(views, name + exts);
      if (match) return match;
    }

    // next, try using `.getView()`
    match = this.getView(views, name, fn);
    if (match) return match;

    // if no match, try without the extension
    var extname = path.extname(name);
    var basename = path.basename(name, extname);

    if (basename !== name && views.hasOwnProperty(basename)) {
      return views[basename];
    }

    var keys = Object.keys(this.engines).concat(extname);
    exts = utils.extsPattern(keys);

    match = this.matchView(views, name + exts);
    if (match) return match;

    if (this.enabled('strict errors')) {
      throw this.error('lookup', 'can\'t find view', arguments);
    }
    return null;
  });

  /**
   * Get all view collections of the given [type].
   *
   * ```js
   * var renderable = template.getType('renderable');
   * //=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
   * ```
   *
   * @param {String} `type` Types are `renderable`, `layout` and `partial`.
   * @api public
   */

  app.mixin('getType', function(type, collections) {
    this.assert('getType', 'type', 'string', type);
    var keys = typeof collections !== 'undefined'
      ? utils.arrayify(collections)
      : this.viewTypes[type];

    var len = keys.length, i = 0;
    var res = {};

    while (len--) {
      var plural = keys[i++];
      res[plural] = this.views[plural];
    }
    return res;
  });

  /**
   * Find a template based on its `viewType`. `.find` returns the first
   * template that matches the given `key`.
   *
   * Searches all views of [view-collections][collections] of the given
   * [viewType], returning the first template found with the given `key`.
   * Optionally pass an array of `collections` to limit the search;
   *
   * ```js
   * template.find('renderable', 'home', ['page', 'post']);
   * ```
   *
   * @param {String} `viewType` The template viewType to search.
   * @param {String} `key` The name of the template to find.
   * @param {Array} `collectionKeys`
   * @return {Object} Returns the first template that matches `key`
   * @api public
   */

  app.mixin('find', function(viewType, name, collectionNames) {
    this.assert('find', 'viewType', 'string', viewType);
    this.assert('find', 'name', 'string', name);

    var collections = this.getType(viewType, collectionNames);
    var template = null;

    for (var key in collections) {
      var collection = collections[key];
      // var template = this.getView(name);
      if (collection.hasOwnProperty(name)) {
        template = collection[name];
        break;
      }
    }
    return template;
  });

  /**
   * Find a renderable template with the given `key`. Searches all `renderable`
   * [view types].
   *
   *   - If `key` is not found `null` is returned
   *   - Optionally limit the search to the specified `collections`.
   *
   * @param {String} `key` The template to search for.
   * @param {Array} `collections`
   * @api public
   */

  app.mixin('findRenderable', function(key, collections) {
    return this.find('renderable', key, collections);
  });

  /**
   * Find a layout template with the given `key`. Searches all `layout`
   * [view types].
   *
   *   - If `key` is not found `null` is returned
   *   - Optionally limit the search to the specified `collections`.
   *
   * @param {String} `key` The template to search for.
   * @param {Array} `collections`
   * @api public
   */

  app.mixin('findLayout', function(key, collections) {
    return this.find('layout', key, collections);
  });

  /**
   * Find a partial template with the given `key`. Searches all `partial`
   * [view types].
   *
   *   - If `key` is not found `null` is returned
   *   - Optionally limit the search to the specified `collections`.
   *
   * @param {String} `key` The template to search for.
   * @param {Array} `collections`
   * @api public
   */

  app.mixin('findPartial', function(key, collections) {
    return this.find('partial', key, collections);
  });
};
