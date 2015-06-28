'use strict';

var App = require('..');
var app = new App();

app.engine('tmpl', require('engine-lodash'));

app.helper('double', function (str) {
  return str + '-' + str;
});

app.helper('before', function (str) {
  return 'before-' + str;
});

app.helper('after', function (str) {
  return str + '-after';
});

/**
 * Create
 */
app.create('page', { loaderType: 'sync' });

/**
 * Load
 */
app.pages('a.tmpl', {
    path: 'a.tmpl',
    data: { date: '2015-12-01' },
    content: '<%= name %>'
  })
  .pages('b', {
    path: 'b.tmpl',
    data: { date: '2015-12-02' },
    content: '<%= name %>'
  })
  .pages('c', {
    path: 'c.tmpl',
    data: { date: '2015-12-03' },
    content: '<%= name %>'
  })
  .pages('d', {
    path: 'd.tmpl',
    data: { date: '2015-12-04' },
    content: '<%= name %>'
  })


var recent = app.pages.recent();

console.log(recent)

