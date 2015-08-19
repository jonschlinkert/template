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
    content: 'before <%= title %> after'
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
  .render('a.tmpl', function (err, res) {
    if (err) return console.log(err);
    console.log(res.content);
  });
