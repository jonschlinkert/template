'use strict';

var App = require('..');
var app = new App();

/**
 * Create
 */
app.create('page');

/**
 * Load
 */
app.page('a', {path: 'a.tmpl', data: { date: '2015-12-01' }, content: '<%= name %>'})
  .page('b', {path: 'b.tmpl', data: { date: '2015-12-02' }, content: '<%= name %>'})
  .page('c', {path: 'c.tmpl', data: { date: '2015-12-03' }, content: '<%= name %>'})
  .page('d', {path: 'd.tmpl', data: { date: '2015-12-04' }, content: '<%= name %>'})


var recent = app.pages.recent();
console.log(recent)

