'use strict';

var App = require('..');
var app = new App();

/**
 * Loader
 */
app.iterator('sync', require('iterator-sync'));
app.loader('view', function (key, value) {
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
  .use(function (views, options, loader) {
    console.log(this)
  })

