'use strict';

var recent = require('recent');
var utils = require('./utils');

function Collection(options) {
  this.mixin('options', options || {});
  var mixins = this.options.mixins || {};

  for (var key in mixins) {
    if (mixins.hasOwnProperty(key)) {
      this.mixin(key, mixins[key].bind(this));
    }
  }
}

Collection.prototype.mixin = function(key, value) {
  utils.defineProperty(this, key, value);
};

Collection.prototype.normalize = function(options) {
  var opts = cloneDeep(options || {});
  return function (file) {
    var context = opts.contexts || {};
    delete opts.contexts;
    file.contexts = extend({}, file.contexts, context);
    file.contexts.create = opts;
    file.options = extend({}, opts, file.options);
    this.handle('onLoad', file, this.handleError('onLoad', {path: file.path}));
    return file;
  }.bind(this);
};

Collection.prototype.recent = function(options) {
  return recent(this, options);
};

Collection.prototype.use = function(fn) {
  fn(this);
  return this;
};

Collection.prototype.find = function(key) {
  return this[key];
};

/**
 * Expose `Collection`
 */

module.exports = Collection;
