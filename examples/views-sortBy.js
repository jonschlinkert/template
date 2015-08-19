'use strict';

var get = require('get-value');
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
    data: { date: '2015-12-05' },
    foo: 'z',
    content: '<%= name %>'
  })
  .pages('b.tmpl', {
    path: 'b.tmpl',
    data: { date: '2015-12-02' },
    foo: 'x',
    content: '<%= name %>'
  })
  .pages('c.tmpl', {
    path: 'c.tmpl',
    data: { date: '2015-12-03' },
    foo: 'c',
    content: '<%= name %>'
  })
  .pages('d.tmpl', {
    path: 'd.tmpl',
    data: { date: '2015-12-04' },
    foo: 'r',
    content: '<%= name %>'
  })


var foo = app.pages.sortBy('locals.foo');
console.log(foo)

var sorted = app.pages.sortBy(function (view) {
  return get(view, 'data.date');
});


