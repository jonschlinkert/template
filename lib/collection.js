'use strict';

var forIn = require('for-in');
var forOwn = require('for-own');
var clone = require('clone-deep');
var Emitter = require('component-emitter');
var get = require('get-value');
var set = require('set-value');
var utils = require('./utils');

/**
 * Create an instance of `Collection`.
 *
 * @api public
 */

function Collection(app, loaders, options) {
  Emitter.call(this);
  utils.defineProp(this, 'options', clone(options || {}));
  utils.defineProp(this, '_callbacks', this._callbacks);
  utils.defineProp(this, 'app', app);
}

/**
 * Collection methods
 */

utils.object.delegate(Collection.prototype, Emitter({

  /**
   * Load items.
   */

  wrap: function (options, fn) {
    return fn(this, options);
  },

  /**
   * Set or get data on the collection.
   */

  data: function (prop, value) {
    return utils.data(this, prop, value);
  },

  /**
   * Set or get an option on the collection.
   */

  option: function (prop, value) {
    return utils.option(this, prop, value);
  },

  /**
   * Set a view.
   */

  set: function (prop, value) {
    set(this, prop, value);
    return this;
  },

  /**
   * Get a view.
   */

  get: function(prop, fn) {
    var name, res;
    // use renameKey function, if passed
    if (typeof fn === 'function') {
      prop = fn(prop);
    }

    if (!!(name = this[prop])) {
      return name;
    }

    // try again with the default renameKey function
    fn = this.options.renameKey;
    if (typeof fn === 'function') {
      name = fn(prop);
    }

    if (name && name !== prop && !!(res = this[name])) {
      return res;
    }
    return get(this, prop);
  },

  /**
   * Run a plugin on the collection instance.
   */

  use: function (fn) {
    fn.call(this, this, this.options);
    return this;
  },

  /**
   * Iterate over the 'own' keys on the collection.
   */

  forOwn: function (fn) {
    forOwn(this, fn);
    return this;
  },

  /**
   * Filter views in the collection.
   */

  filter: function (cb) {
    var res = {};
    forIn(this, function (value, key, obj) {
      if (cb(value, key, obj) && key !== 'stash') {
        res[key] = value;
      }
    });
    this.stash = res;
    return this;
  },

  /**
   * Return filtered
   */

  value: function () {
    return this.stash || this;
  },

  /**
   * Call the given method on each value in `obj`.
   */

  visit: function (prop, obj) {
    return utils.visit(this, prop, obj);
  },

  /**
   * Whitelisted prototype methods.
   */

  whitelist: ['option', 'get', 'set', 'filter', 'use', 'value', 'forOwn'],

  /**
   * Mix the given collection methods onto `obj`
   */

  forward: function (obj, keys) {
    utils.forward(obj, this, keys || this.whitelist);
  }
}));

/**
 * Expose `Collection`
 */

module.exports = Collection;
