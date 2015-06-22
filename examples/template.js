'use strict';

var Template = require('..');
var template = new Template();

/**
 * Loader
 */
template.loader('sync', function (key, value) {
  return (this[key] = value);
});

/**
 * Create
 */
template.create('pages', ['sync']);

/**
 * Load
 */
template.pages('a', {content: 'aaa...'});
template.pages('b', {content: 'bbb...'});
template.pages('c', {content: 'ccc...'});
template.pages('d', {content: 'ddd...'})
  .use(function (views, options, loaders) {
    // console.log(arguments)
  })

var pages = template.pages('e', {content: 'eee...'})
  .use(function (views, options, loaders) {
    // console.log(views)
  })
  .filter(function (val, key, views) {
    return /^[a-c]/.test(key);
  })
  .filter(function (val, key, views) {
    return /^[a-c]/.test(key);
  })

console.log(pages);
console.log(template.views.pages);
