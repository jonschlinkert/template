'use strict';

var util = require('util');
var extend = require('extend-shallow');
var utils = require('./utils');

/**
 * Create a new `View` with the given `value` and `options`.
 *
 * @param {[type]} value [description]
 * @param {[type]} options [description]
 * @param {[type]} collection [description]
 */

function View(file, options, collection) {
  utils.defineProperty(this, 'collection', collection);
  utils.defineProperty(this, 'app', collection.options.app);

  file.contexts = extend({}, file.contexts, options.contexts);
  file.contexts.create = options;
  file.options = extend({}, options, file.options);

  // call app's `onLoad` middleware handler
  this.app.handle('onLoad', file);
  this.mixin(file);
  return file;
}

/**
 * Get related views from the collection instance.
 */

View.prototype.related = function(prop, options) {
  var collection = this.collection;
  var value = utils.get(this, prop);
  return collection.filter(prop, value, options);
};

/**
 * Extend locals for a view.
 */

View.prototype.locals = function(locals) {
  return extend(this.locals, locals);
};

/**
 * Register a context for a view.
 */

View.prototype.context = function(prop, val) {
  return utils.set(this.contexts, prop, val);
};

/**
 * Set a view.
 */

View.prototype.set = function(prop, value) {
  utils.set(this, prop, value);
  return this;
};

/**
 * Get a view.
 */

View.prototype.get = function(prop) {
  return utils.get(this, prop);
};

/**
 * Run a middleware on `view`
 */

View.prototype.use = function(fn) {
  fn(this);
  return this;
};

/**
 * Render a view.
 */

View.prototype.render = function(locals, cb) {
  this.app.renderTemplate(this, locals, cb);
  return this;
};

/**
 * Mix the properties of the given object onto the view instance.
 */

View.prototype.mixin = function(value) {
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      var val = value[key];
      if (typeof val === 'function') {
        utils.defineProperty(this, key, val.bind(this));
      } else {
        utils.defineProperty(this, key, val);
      }
    }
  }
};

/**
 * Expose `View`
 */
module.exports = View;
