'use strict';

var isObject = require('isobject');
var Loaders = require('loader-cache');
var Views = require('./lib/views');

/**
 * Create a new instance of `Template` with the given `options.
 *
 * @param {Object} `options`
 * @api public
 */

function Template(options) {
  if (!(this instanceof Template)) {
    return new Template(options);
  }
  this.loaders = new Loaders(options);
  this.views = {};
  this.cache = {};
}

/**
 * Template methods
 */

Template.prototype = {
  constructor: Template,

  /**
   * Create a new `Views` collection.
   */

  create: function (name, options, loaders) {
    var views = new Views(options, loaders);

    this.views[name] = views;
    this.mixin(name, function () {
      return views.load.apply(views, arguments);
    });

    this[name].__proto__ = views;
    return this;
  },

  /**
   * Add a new `Iterator` to the instance.
   */

  iterator: function (name, fn) {
    this.loaders.iterator(name, fn);
    return this;
  },

  /**
   * Add a new `Loader` to the instance.
   */

  loader: function (name, opts, fn) {
    this.loaders.loader(name, opts, fn);
    return this;
  },

  /**
   * Add a method to the Template prototype
   */

  mixin: function (name, fn) {
    Template.prototype[name] = fn;
  }
};

/**
 * Expose `Template`
 */

module.exports = Template;
