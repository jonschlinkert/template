'use strict';

var util = require('util');
var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('extend-shallow', 'extend');
lazy('clone-deep', 'clone');
lazy('object.omit', 'omit');
lazy('write');

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
  this.initFile(file);
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

  initFile: function (file) {
    this.src = file.src || {};
    if (this.path) {
      this.src.path = this.path;
    }
    if (Buffer.isBuffer(this.contents)) {
      this.content = this.contents.toString();
    }
    if (this.content) {
      this.options.orig = this.content;
    }

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
    var opts = lazy.clone(this.options);
    var res = {};

    lazy.omit(this, keys, function (val, key) {
      res[key] = lazy.clone(val);
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
   * Write the item to disk asynchronously.
   *
   * @param {String} `fp` Destination filepath.
   * @param {Function} `cb` Callback function
   * @returns {Object} Returns the instance for chaining.
   * @api public
   */

  write: function (fp, cb) {
    if (typeof fp === 'function') {
      cb = fp;
      fp = null;
    }

    if (typeof cb !== 'function') {
      throw new Error('async `write` was called without a callback function.');
    }

    var dest = fp || this.dest.path;
    var src = this.src.path;
    var str = this.content;

    if (str) {
      lazy.write(dest, str, cb);
    } else {
      lazy.copy(src, dest, cb);
    }

    this.emit('write', dest);
    return this;
  },

  /**
   * Write the item to disk synchronously.
   *
   * @param  {String} `fp` Destination filepath.
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  writeSync: function (fp) {
    var dest = fp || this.dest.path;
    var src = this.src.path;
    var str = this.content;

    if (str) {
      lazy.write.sync(dest, str);
    } else {
      lazy.copy.sync(src, dest);
    }

    this.emit('write', dest);
    return this;
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
  lazy.extend(Ctor, File);
};

/**
 * Expose `File`
 */

module.exports = File;
