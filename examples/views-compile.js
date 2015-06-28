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
    title: 'aaa',
    content: 'This is <%= title %>'
  })
  .pages('b.tmpl', {
    path: 'b.tmpl',
    title: 'bbb',
    content: 'This is <%= title %>'
  })
  .pages('c.tmpl', {
    path: 'c.tmpl',
    title: 'ccc',
    content: 'This is <%= title %>'
  })
  .compile('c.tmpl')
  .pages('d.tmpl', {
    path: 'd.tmpl',
    title: 'ddd',
    content: 'This is <%= title %>'
  })
  .compile('a.tmpl');


var page = app.pages.get('c.tmpl');

console.log(page.fn({title: 'Foo'}))
