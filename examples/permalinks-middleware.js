'use strict';

var App = require('..');
var app = new App();

app.engine('hbs', require('engine-handlebars'));

var preset = {
  blog: '/blog/foo'
  archives: '/archives/foo'
};

/**
 * Middleware
 */

app.preRender(/.*\/archives\/.*\.hbs$/, function (file, next) {
  file.permalink('blog/archives/:date:ext');
  next();
});

app.preRender(/.*\/categories\/.*\.hbs$/, function (file, next) {
  file.permalink('blog/categories/:date:ext');
  next();
});

app.preRender(/.*\/tags\/.*\.hbs$/, function (file, next) {
  file.permalink('blog/tags/:date:ext');
  next();
});

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
