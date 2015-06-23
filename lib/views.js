'use strict';

var util = require('util');
var path = require('path');
var Collections = require('./collections');
var utils = require('./utils');
var View = require('./view');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views(/*options, loaders, app*/) {
  Collections.apply(this, arguments);
}

util.inherits(Views, Collections);

/**
 * Views prototype methods
 */

utils.defineProps(Views.prototype, {

  /**
   * Set a view.
   */

  set: function (key, value) {
    this[key] = new View(value, this, this.app);
    return this;
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
