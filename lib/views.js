'use strict';

var util = require('util');
var path = require('path');
var extend = require('extend-shallow');
var Collection = require('./collection');
var loaders = require('./loaders/index')
var utils = require('./utils');
var View = require('./view');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views(options, loaders, app) {
  Collection.apply(this, arguments);
}

util.inherits(Views, Collection);

/**
 * Views prototype methods
 */

utils.defineProps(Views.prototype, {

  /**
   * Set a view on the collection.
   */

  set: function (key, val) {
    this.app.handle('onLoad', val, val.locals);
    this[key] = new View(val, this, this.app);
    return this;
  },

  /**
   * Load views onto the collection.
   */

  loader: function(options) {
    var opts = utils.omit(options, 'contexts');
    var type = opts.loaderType;

    var last = loaders.last(this, function last(key, val) {
      return this.set(key, val);
    }.bind(this));

    return last[type];
  },

  /**
   * Load views.
   */

  load: function (key, value) {
    var args = [].slice.call(arguments);
    var last = args[args.length - 1];
    if (typeof last === 'function') {
      var fn = args.pop();
      var res = fn.apply(this, args);

      for (var key in res) {
        if (res.hasOwnProperty(key)) {
          this.set.call(this, key, res[key]);
        }
      }
      return this;
    }
    return this.set.apply(this, args);
  },

  /**
   * Render a view in the collection.
   *
   * @param  {String|Object} `view` View key or object.
   * @param  {Object} `locals`
   * @param  {Function} `fn`
   * @return {Object}
   */

  render: function (view, locals, fn) {
    var args = [].slice.call(arguments, 1);
    args = [this[view] || view].concat(args);
    return this.app.render.apply(this.app, args);
  },

  /**
   * Set view types for the collection.
   *
   * @param {String} `plural` e.g. `pages`
   * @param {Object} `options`
   * @api private
   */

  viewType: function() {
    this.options.viewType = this.options.viewType || 'renderable';
    return utils.arrayify(this.options.viewType);
  },

  /**
   * Rename template keys.
   */

  renameKey: function (fp, options) {
    var opts = extend({}, this.options, options);
    var fn = opts.renameKey || path.basename;
    return fn(fp);
  }
});

/**
 * Expose `Views`
 */

module.exports = Views;
