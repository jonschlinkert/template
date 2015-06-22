'use strict';

var Template = require('..');
var template = new Template();

/**
 * Loader
 */
template.iterator('sync', require('iterator-sync'));
template.loader('sync', function (key, value) {
  return (this[key] = value);
});

/**
 * Create
 */
template.create('pages', { loaderType: 'sync' });

/**
 * Load
 */
template.pages('a', {path: 'a', content: 'aaa...'});
template.pages('b', {path: 'b', content: 'bbb...'});
template.pages('c', {path: 'c', content: 'ccc...'});
template.pages('d', {path: 'd', content: 'ddd...'})
  .use(function (views, options, loaders) {
    // console.log(arguments)
  })

var page = template.views.pages.d
  .use(function (view) {
    console.log('view:', view)
  })

console.log('page:', page);
