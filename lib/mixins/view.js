'use strict';

var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('extend-shallow', 'extend');
lazy('relative-dest', 'dest');
lazy('get-value', 'get');
lazy('parse-filepath');
lazy('dashify');


module.exports = function (view) {
  view.visit('mixin', {

    /**
     * Get the cwd
     */

    cwd: function (dir) {
      dir = dir || this.options.cwd;
      this.options.cwd = dir;
      return dir;
    },

    /**
     * Parse `view.path` into an object.
     */

    parsePath: function (data) {
      var parse = function() {
        var parsed = lazy.extend({}, lazy.parseFilepath(this.path), data);
        if (typeof parsed.ext === 'undefined') {
          parsed.ext = parsed.extname;
        }
        return parsed;
      }.bind(this);
      return this.fragmentCache('path', parse);
    },

    /**
     * Returns a slugified filepath. If `filepath` is not passed,
     * `view.data.slug` or `view.path` will be slugified.
     */

    slug: function(filepath, fn) {
      fn = fn || lazy.dashify;
      if (typeof filepath === 'undefined') {
        var ctx = this.context();
        filepath = ctx.slug || this.path;
      }
      return fn(filepath);
    },

    /**
     * Strip HTML from the given `str` or `view.content`
     *
     * @param  {String} str HTML string
     * @return {String}
     */

    stripHtml: function(str) {
      if (typeof str !== 'string') {
        str = this.content;
      }
      if (typeof str !== 'string') return '';
      str = str.replace(/(<([^>]+)>)/g, '');
      return str.trim();
    },

    /**
     * Generate an excerpt for a view.
     *
     * ```js
     * app.posts.get('foo.md')
     *   .excerpt()
     *   .render(function (err, res) {
     *     //=>
     *   });
     * ```
     *
     * @param {Object} `options` Excerpt options.
     *     @option {Object} `template` Template to use for the excerpt tag.
     * @return {Object}
     */

    excerpt: function (options) {
      options = options || {};
      lazy.extend(options, this.options.excerpt || {});

      var re = /<!--+\s*more\s*--+>/;
      var str = this.content;
      var view = this;

      var link = options.link || '<a id="more"></a>';

      this.content = str.replace(re, function (match, i) {
        view.data.excerpt = str.slice(0, i).trim();
        view.data.more = str.slice(i + match.length).trim() + link;
        return '';
      });
      return this;
    },

    dest: function (dir) {
      this.data.dest = this.data.dest || {};
      if (typeof dir === 'function') {
        this.data.dest.path = dir(this);
      } else {
        // TODO: dest function
      }
      return this;
    },

    /**
     * Generate a permalink for a view.
     *
     * ```js
     * app.posts.get('foo.md')
     *   .render(function (err, res) {
     *     dest(res.permalink(), res);
     *     //=>
     *   });
     * ```
     * @param  {Object} `locals` pass any additional locals for context.
     * @return {String} Returns a permalink string.
     * @api public
     */

    permalink: function (structure, locals) {
      if (typeof structure !== 'string') {
        locals = structure;
        structure = null;
      }

      var self = this;

      var data = {};
      lazy.extend(data, this);
      lazy.extend(data, this.parsePath());
      lazy.extend(data, this.context(locals));
      this.data.dest = this.data.dest || {};

      var opts = lazy.get(data, 'permalinks') || {};
      lazy.extend(opts, this.options.permalinks || {});

      if (typeof structure !== 'string') {
        structure = opts.structure || ':path';
      }

      return structure.replace(/:(\w+)(?:\((.*)\))?/g, function (m, param, prop) {
        var res = data[param] || param;
        if (typeof res === 'function' && prop) {
          return res.call(data, prop);
        }

        self.data.dest = res;
        return res;
      });
    }
  });
};
