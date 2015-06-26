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

var page = app.pages.get('d')
  .use(function (view) {
    console.log('view:', view)
  })
  .render(function (err, view) {
    console.log('view:', view)
  })

console.log('page:', page);
console.log('------');

var a = app.pages.get('d').clone()
console.log('page:', a);

// rendering snippet
app.asyncHelper('snippet', function (key, options, cb) {
  app.pages.get(key)
    .use(function (view) {
      app.render(trim(view.content), view.data, cb);
    });
});
