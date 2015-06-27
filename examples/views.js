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
app.create('page', { loaderType: 'sync' });

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

var pages = app.pages('e', {path: 'e', content: 'eee...'})
  .use(function (views, options, loaders) {
    // console.log(views)
  })
  .filter(function (val, key, views) {
    return /^[a-c]/.test(key);
  })
  // .filter(function (val, key, views) {
  //   return /^c/.test(key);
  // })
  .value()

var pages2 = app.pages.filter(function (val, key, views) {
    return /^[a-f]/.test(key);
  }).value();

// console.log('pages:\n', pages);
console.log('pages2:\n', pages2);
// console.log('-----');
// console.log('app.views.pages:\n', app.views.pages);
// console.log('-----');
// console.log('get:\n', app.pages.get('a'));
