'use strict';

var App = require('..');
var app = new App();

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
app.pages('a', {path: 'a', content: 'aaa...'});
app.pages('b', {path: 'b', content: 'bbb...'});
app.pages('c', {path: 'c', content: 'ccc...'});
app.pages('d', {path: 'd', content: 'ddd...'})
  .use(function (views, options, loaders) {
    // console.log(arguments)
  })



