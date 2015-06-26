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
 * Loader
 */
app.iterator('sync', require('iterator-sync'));
app.loader('sync', function (key, value) {
  return (this[key] = value);
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
    name: 'aaa',
    content: '<%= name %>'
  })
  .pages('b', {
    path: 'b.tmpl',
    name: 'bbb',
    content: '<%= name %>'
  })
  .pages('c', {
    path: 'c.tmpl',
    name: 'ccc',
    content: '<%= name %>'
  })
  .pages('d', {
    path: 'd.tmpl',
    name: 'ddd',
    content: '<%= name %>'
  })

var page = app.pages.get('a.tmpl');

page.render(function (err, res) {
  if (err) return console.log(err);
  console.log(res);
});

