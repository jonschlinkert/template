'use strict';

var path = require('path');
var util = require('util');
var extend = require('extend-shallow');

/**
 * Lazily required dependencies
 */

var lazy = require('lazy-cache')(require);
var assign = lazy('assign-value');
var clone = lazy('clone-deep');
var omit = lazy('object.omit');

/**
 * Local dependencies
 */

var utils = require('./utils');
var Item = require('./item');

/**
 * Create an instance of `File`.
 */

function File(file, options) {
  Item.call(this, file, options);
  this.init(file);
  return file;
}

/**
 * Inherit `Item`
 */

Item.extend(File);

/**
 * `File` prototype methods
 */

utils.delegate(File.prototype, {
  constructor: File,

  /**
   * Initialize file with base properties.
   */

  init: function (file) {
    if (!file.content && Buffer.isBuffer(file.contents)) {
      file.content = file.contents.toString();
    }
    this.path = file.path;

    // ensure that `file` has `path` and `content` properties
    this.validate(file);

    this.options.orig = file.content;
    this.options.plural = this.collection.options.plural;
    this.options.handled = this.options.handled = [];

    this.src = file.src || {};
    this.src.path = this.src.path || this.path;

    // add non-emumerable properties
    this.defineOption('route', this.options.route);
    this.define('_callbacks', this._callbacks);
    file.__proto__ = this;
    file.path = this.path;

    // handle `onLoad` middleware routes
    this.app.handle('onLoad', file);
  },

  /**
   * Return a clone of the file instance.
   */

  clone: function (keys) {
    var Parent = this.constructor;
    var opts = clone()(this.options);
    var res = {};

    omit()(this, keys, function (val, key) {
      res[key] = clone()(val);
    });
    return new Parent(res, opts);
  },

  /**
   * Get the basename of a file path.
   */

  renameKey: function(key) {
    var fn = this.pickOption('renameKey');
    if (!fn) {
      fn = this.collection.renameKey || this.app.renameKey;
    }
    if (typeof fn !== 'function') return key;
    return fn(key);
  },

  /**
   * Validate a file.
   */

  validate: function (file) {
    if (typeof file.path === 'undefined') {
      utils.error('File#validate `path` is a required field: ', file);
    }
  }
});

/**
 * Ensure that the `layout` property is set on a file.
 */

Object.defineProperty(File.prototype, 'layout', {
  set: function(val) {
    this.define('_layout', val);
  },
  get: function() {
    if (typeof this._layout !== 'undefined') {
      return this._layout;
    }
    if (typeof this.data.layout !== 'undefined') {
      return this.data.layout;
    }
    if (typeof this.locals.layout !== 'undefined') {
      return this.locals.layout;
    }
    if (typeof this.options.layout !== 'undefined') {
      return this.options.layout;
    }
  }
});

/**
 * Expose `extend`, to allow other classes to inherit
 * from the `File` class.
 *
 * ```js
 * function MyFile(options) {...}
 * File.extend(MyFile);
 * ```
 *
 * @param  {Object} `Ctor` Constructor function to extend with `File`
 * @return {undefined}
 * @api public
 */

File.extend = function (Ctor) {
  util.inherits(Ctor, File);
};

/**
 * Expose `File`
 */

module.exports = File;
