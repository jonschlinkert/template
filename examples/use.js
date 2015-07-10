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
app.create('page', { loaderType: 'sync' });

/**
 * Collection plugins
 */
app.pages('a', {path: 'a', name: 'a', content: '<%= name %>'})
  .use(function (views, options, loader) {
    console.log(this)
  });

app.pages('b', {path: 'b', name: 'b', content: '<%= name %>'})
  .use(function (views, options, loader) {
    console.log(this)
  });

app.pages('c', {path: 'c', name: 'c', content: '<%= name %>'})
  .use(function (views, options, loader) {
    console.log(this)
  });

app.pages('d', {path: 'd', name: 'd', content: '<%= name %>'})
  .use(function (views, options, loader) {
    console.log(this)
  });


/**
 * Item plugins
 */

var page = app.pages.get('d')
  .use(function (views, options, loader) {
    console.log(this)
  });
