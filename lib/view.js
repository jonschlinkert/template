'use strict';

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
  this.options = this.options || {};
  this.defineProp('collection', collection);
  this.defineProp('app', collection.options.app);

  file.contexts = extend({}, file.contexts, options.contexts);
  file.contexts.create = options;
  file.options = extend({}, options, file.options);

  // call app's `onLoad` middleware handler
  this.app.handle('onLoad', file);
  this.mixin(file);

  this.defineOption('app', file.app);
  this.defineOption('route', this.options.route);
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
 * Define a non-enumerable option property
 */

View.prototype.defineOption = function(key, value) {
  utils.defineProperty(this.options, key, value);
};

/**
 * Define a non-enumerable property
 */

View.prototype.defineProp = function(key, value) {
  utils.defineProperty(this, key, value);
};

/**
 * Mix the properties of the given object onto the view instance.
 */

View.prototype.mixin = function(value) {
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      var val = value[key];
      if (typeof val === 'function') {
        this.defineProp(key, val.bind(this));
      } else {
        this.defineProp(key, val);
      }
    }
  }
};

/**
 * Expose `View`
 */
module.exports = View;
