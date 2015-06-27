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
 * Create
 */
app.create('page', { loaderType: 'sync' });

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
    console.log(arguments)
  })

// console.log(app.views.pages);
