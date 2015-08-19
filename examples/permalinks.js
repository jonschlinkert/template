'use strict';

var path = require('path');
var App = require('..');
var app = new App();

app.engine('hbs', require('engine-handlebars'));

/**
 * Create
 */
app.create('page', {
  renameKey: function (key) {
    return path.basename(key);
  }
});

/**
 * Load
 */
app.page('src/content/a.hbs', {path: 'a.hbs', content: '<%= name %>'})
  .page('src/content/b.hbs', {path: 'b.hbs', content: '<%= name %>'})
  .page('src/content/c.hbs', {path: 'c.hbs', content: '<%= name %>'})
  .page('src/content/d.hbs', {path: 'd.hbs', content: '<%= name %>'})



var page = app.pages.get('a.hbs');

var permalink = page.permalink('blog/posts/:upper(name).html', {
  upper: function (str) {
    return str.toUpperCase();
  }
});
console.log(permalink);

console.log(page.permalink(':aaa/:bbb/:ccc:ext', {aaa: 'x', bbb: 'y', ccc: 'z'}));
// console.log(page.parsePath());
