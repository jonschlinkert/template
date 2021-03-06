'use strict';

var App = require('..');
var app = new App();


// Register an engine for rendering `tmpl` templates
app.engine('tmpl', require('engine-lodash'));

// Create a view collection: `page`, then load pages
app.create('page', { loaderType: 'sync' });

app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= name %>', name: 'aaa'});
app.pages('b.tmpl', {path: 'b.tmpl', content: '<%= name %>', name: 'bbb'});
app.pages('c.tmpl', {path: 'c.tmpl', content: '<%= name %>', name: 'ccc'});
app.pages('d.tmpl', {path: 'd.tmpl', content: '<%= name %>', name: 'ddd'})


// render
app.pages.get('a.tmpl')
  .render(function (err, res) {
    if (err) return console.log(err);
    console.log(res);
  });
