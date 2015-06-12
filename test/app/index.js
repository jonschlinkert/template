'use strict';

var util = require('util');
var routes = require('en-route');
var transforms = require('./transforms');
var Template = require('../..');

module.exports = App;

function App(options) {
  Template.call(this, options);
  this._defaultTransforms();
  this.create('page', { viewType: 'renderable' });
  this.create('partial', { viewType: 'partial' });
  this.create('layout', { viewType: 'layout' });
}

Template.mixin(App.prototype);
App.Router = routes.Router;
App.Route = routes.Route;

App.prototype._defaultTransforms = function() {
  this.transform('engines', transforms.engines);
};
