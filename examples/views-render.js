'use strict';

var App = require('..');
var app = new App();

app.engine('tmpl', require('engine-lodash'));

/**
 * Create
 */
app.create('page', { loaderType: 'sync' });

/**
 * Load
 */
app.pages('a.tmpl', {
    path: 'a.tmpl',
    title: 'aaa',
    content: '<%= title %>'
  })
  .pages('b', {
    path: 'b.tmpl',
    title: 'bbb',
    content: '<%= title %>'
  })
  .pages('c', {
    path: 'c.tmpl',
    title: 'ccc',
    content: '<%= title %>'
  })
  .pages('d', {
    path: 'd.tmpl',
    title: 'ddd',
    content: '<%= title %>'
  })
  .compile('a.tmpl');
  // .render('a.tmpl', function (err, res) {
  //   if (err) return console.log(err);
  //   console.log(res);
  // });

var page = app.pages.get('a.tmpl');

console.log(page.fn)
