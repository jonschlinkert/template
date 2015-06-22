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

var pages = template.pages('e', {path: 'e', content: 'eee...'})
  .use(function (views, options, loaders) {
    // console.log(views)
  })
  .filter(function (val, key, views) {
    return /^[a-c]/.test(key);
  })
  .filter(function (val, key, views) {
    return /^c/.test(key);
  })
  .value()

console.log('pages:\n', pages);
console.log('-----');
console.log('template.views.pages:\n', template.views.pages);
console.log('-----');
console.log('get:\n', template.pages.get('a'));
