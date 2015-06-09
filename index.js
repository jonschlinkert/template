/*!
 * next-next <https://github.com/jonschlinkert/next-next>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var extend = require('extend-shallow');
var inflect = require('pluralize');
var LoaderCache = require('loader-cache');
var Collection = require('./lib/collection');

function Template() {
  this.inflection = {};
  this.loaders = {};
  this.views = {};
}

Template.prototype.create = function(singular, options, loaders) {
  this.decorate(singular, this.inflect(singular), options, loaders);
};

Template.prototype.decorate = function(singular, plural, options, loaders) {
  this.views[plural] = new Collection({name: plural});

  Template.prototype[plural] = function(key, value, locals, opts) {
    this.loader(plural).apply(this, arguments);
    return this;
  };

  Template.prototype[singular] = function(key, value, locals, opts) {
    this.loader(plural).apply(this, arguments);
    return this;
  };
};

Template.prototype.inflect = function(name) {
  return this.inflection[name] || (this.inflection[name] = inflect(name));
};

Template.prototype.loader = function(plural, opts, stack) {
  var loader = this.loaders[plural] = new LoaderCache(opts);
  var load = loader.compose.apply(loader, arguments);
  return function (key, value, locals, opts) {
    this.views[plural].load(key, load.apply(this, arguments));
    return this;
  };
};

var template = new Template();
template.create('page');
template.create('layout');
template.create('partial');
template.pages('a', {contents: 'this is contents'});
template.pages('b', {contents: 'this is contents'});
console.log(template)
// console.log(template.pages('a').contents.toString())

// template.pages({}, ['foo', 'bar']).src('abc/*.hbs')
//   .pipe(one())
//   .pipe(two())
//   .pipe(template.pages.dest())
