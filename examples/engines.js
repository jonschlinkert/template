'use strict';

var App = require('..');
var app = new App();

/**
 * Loader
 */
app.engine('tmpl', require('engine-lodash'));

/**
 * Create
 */
app.create('page', { loaderType: 'sync' });

/**
 * Load
 */
app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= name %>', name: 'aaa'});
app.pages('b.tmpl', {path: 'b.tmpl', content: '<%= name %>', name: 'bbb'});
app.pages('c.tmpl', {path: 'c.tmpl', content: '<%= name %>', name: 'ccc'});
app.pages('d.tmpl', {path: 'd.tmpl', content: '<%= name %>', name: 'ddd'})
  .use(function (views, options, loaders) {
    // console.log(arguments)
  })

var page = app.pages.get('a.tmpl');

app.render(page, {}, function (err, res) {
  if (err) return console.log(err);
  console.log(res);
});
