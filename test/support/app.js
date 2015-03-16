'use strict';

var util = require('util');
var parser = require('parser-front-matter');
var Template = require('../..');
var utils = require('../../lib/');

module.exports = App;

function App(options) {
  Template.call(this, options);
  this._initDefaults();
}
util.inherits(App, Template);

App.prototype._initDefaults = function() {
  if (!this.option('default routes')) {
    return;
  }
  // get extensions from engines
  var extensions = Object.keys(this.engines);

  // use extensions to create the route
  var re = utils.extensionRe(extensions);

  this.onLoad(re, function(file, next) {
    parser.parse(file, function(err) {
      if (err) return next(err);
      next();
    });
  });
};
