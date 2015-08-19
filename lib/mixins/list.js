'use strict';

var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('extend-shallow', 'extend');
lazy('group-array');
lazy('sort-object');
lazy('array-sort');
lazy('recent');

/**
 * Expose List mixins
 */

module.exports = function (view) {

  /**
   * Mix methods onto `List`
   */

  view.visit('mixin', {

    /**
     * Generate list pages based on the number of views in the collection.
     * This method should be called pre-render.
     *
     * @param  {View} `view` The view to use as a template for pages.
     * @param  {Object} `options` Additional options to use.
     * @return {Object} new List object containing the new pages as items.
     * @api public
     */

    paginate: function (view, options) {
      // `paginate` will return a new `List` from the same parent constructor
      var Parent = this.constructor;
      // New "pages" in the list will use the `View` constructor
      var View = view.constructor;
      // ensure that items being paginated are the same as this List's items.
      var Item = this.get('Item');

      var opts = options || {};
      var keys = Object.keys(this.keyMap);
      var items = this.items.map(function (item, i) {
        item.key = keys[i];
        return item;
      });

      var len = items.length, i = 0, pageNum = 1;
      var totalPages = Math.ceil(len / opts.limit);
      var self = this;

      // helper function to create a new page to put into the returned list.
      function createPage() {
        var page = new View(view.clone(), lazy.extend({}, view.options, opts));
        page.data.pagination = new Parent(lazy.extend({}, self.options, {Item: Item}));
        return page;
      }

      function updateProperties(page) {
        page.data.pagination.collection = self.options.collection;
        page.data.pagination.first = 1;
        page.data.pagination.prev = pageNum === 1 ? 1 : pageNum;
        page.data.pagination.num = pageNum++;
        page.data.pagination.next = pageNum >= totalPages ? totalPages : pageNum;
        page.data.pagination.last = totalPages;
        page.data.pagination.index = page.data.pagination.num;
        page.data.pagination.limit = opts.limit;
        page.data.pagination.total = totalPages;
      }

      // Create a new list: `pages`
      var pages = new Parent(lazy.extend({}, this.options, opts, {Item: View}));
      var page = createPage();

      while (len--) {
        var item = items[i++];
        // each item being paginated will go into the pagination list
        // for the current page
        page.data.pagination.item(item.key, item);
        if (i % opts.limit === 0) {
          updateProperties(page);
          pages.item('page-' + (pageNum-1), page);
          page = createPage();
        }
      }

      if (i % opts.limit !== 0) {
        updateProperties(page);
        pages.item('page-' + (pageNum-1), page);
      }

      return pages;
    },

    /**
     * Sort list items.
     *
     * @param  {String} `prop` Property to sort by, undefined to sort by keys.
     * @param  {Function} `fn` Optional getter function to get items by.
     * @return {Object} Returns current instance to enable chaining
     * @api public
     */

    sortBy: function (prop, fn) {
      if (typeof prop === 'function') {
        fn = prop;
        prop = undefined;
      }

      if (typeof prop === 'undefined') {
        return this.sortByKeys(fn);
      }
      return this.sortByItems(prop, fn);
    },

    /**
     * Sort list items by their keys.
     *
     * @param  {Function} `fn` Optional getter function to get items by.
     * @return {Object} Returns current instance to enable chaining
     * @api public
     */

    sortByKeys: function (fn) {
      var items = this.items;
      var sorted = lazy.sortObject(this.keyMap, {prop: undefined, get: fn});
      var keys = Object.keys(sorted);
      var len = keys.length, i = -1;
      var arr = new Array(len);

      while (++i < len) {
        var key = keys[i];
        arr[i] = items[sorted[key]];
        sorted[key] = i;
      }

      this.items = arr;
      this.keyMap = sorted;
      return this;
    },

    /**
     * Sort list items by a property on each item.
     *
     * @param  {String} `prop` Property to sort by.
     * @param  {Function} `fn` Optional getter function to get items by.
     * @return {Object} Returns current instance to enable chaining
     * @api public
     */

    sortByItems: function (prop) {
      var keys = Object.keys(this.keyMap);
      var items = this.items.map(function (item, i) {
        item.key = keys[i];
        return item;
      });
      var sorted = lazy.arraySort(items, prop);
      this.items = sorted;
      this.keyMap = this.items.reduce(function (acc, item, i) {
        acc[item.key] = i;
        return acc;
      }, {});
      return this;
    },

    /**
     * Group list by specified prop string.
     * Returns list of lists of items.
     *
     * ```js
     * app.posts.groupBy('data.date', function (date) { return new Date(date).getYear(); });
     * //=> {'2015': [{name: 'page-1'}]}
     * ```
     *
     * @param  {String} `prop` Property string to group by
     * @param {Function} `fn` Grouping function to use.
     * @return {Object} new List object with individual groups as items.
     * @api public
     */

    groupBy: function () {
      return lazy.groupArray(this.items, [].slice.call(arguments));
    },

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
      var obj = {};
      var items = this.items;
      for (var key in items) {
        var val = items[key];
        if (val && typeof val !== 'function' && val.path) {
          obj[key] = val;
        }
      }
      this.items = lazy.recent(obj, options);
      return this;
    }
  });
};
