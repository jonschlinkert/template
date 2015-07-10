'use strict';

var App = require('..');
var app = new App();

app.engine('hbs', require('engine-handlebars'));

/**
 * Create
 */
app.create('page', { loaderType: 'sync' });

/**
 * Load
 */
app.pages('a.hbs', {path: 'a.hbs', name: 'aaa', content: '<%= name %>'})
  .pages('b', {path: 'b.hbs', name: 'bbb', content: '<%= name %>'})
  .pages('c', {path: 'c.hbs', name: 'ccc', content: '<%= name %>'})
  .pages('d', {path: 'd.hbs', name: 'ddd', content: '<%= name %>'})


var page = app.pages.get('a.hbs')
  .render(function (err, res) {
    if (err) return console.log(err);
    // console.log(res);
  });

console.log(page)

// console.log(page.permalink());
console.log(page.permalink(':aaa/:bbb/:ccc:ext', {aaa: 'x', bbb: 'y', ccc: 'z'}));
console.log(page.parsePath());
