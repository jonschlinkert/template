'use strict';

var App = require('..');
var app = new App();

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
app.create('pages', { loaderType: 'sync' });

/**
 * Load
 */
app.pages('a', {
    path: 'a',
    name: 'a',
    content: '<%= name %>'
  })
  .pages('b', {
    path: 'b',
    name: 'b',
    content: '<%= name %>'
  })
  .pages('c', {
    path: 'c',
    name: 'c',
    content: '<%= name %>'
  })
  .pages('d', {
    path: 'd',
    name: 'd',
    content: '<%= name %>'
  })
  .render(function (views, options, loader) {
    console.log(this)
  })

console.log(app.views.pages)
