'use strict';

var util = require('util');
var parser = require('parser-front-matter');
var routes = require('en-route');
var utils = require('../../lib/');
var transforms = require('./transforms');
var Template = require('../..');
var Router = routes.Router;
var Route = routes.Route;

module.exports = App;

function App(options) {
  Template.call(this, options);
  // this._initOptions();
  this._loadTransforms();
  // this._initDefaults();
}
util.inherits(App, Template);

App.Router = routes.Router;
App.Route = routes.Route;

App.prototype._initDefaults = function() {
  if (!this.disabled('default routes')) {
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
  }
};

App.prototype._initOptions = function() {
  this.option('viewEngine', '*');
  this.option('delims', ['<%', '%>']);
};

App.prototype._loadTransforms = function() {
  this.transform('engines', transforms.engines);
};
