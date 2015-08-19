'use strict';

var App = require('..');
var app = new App();

app.data({name: 'Assemble'});


// Register an engine for rendering `tmpl` templates
app.engine('tmpl', require('engine-lodash'));

// Create a view collection: `page`, then load pages
app.create('layout', { viewType: 'layout' });
app.create('page');


app.layouts('b.tmpl', {path: 'b.tmpl', content: 'AAA\n{% body %}\nBBB', layout: 'c.tmpl'});
app.layouts('c.tmpl', {path: 'c.tmpl', content: 'AAA\n{% body %}\nBBB', layout: 'd.tmpl'});
app.layouts('d.tmpl', {path: 'd.tmpl', content: 'AAA\n{% body %}\nBBB'});


app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= name %>', layout: 'b.tmpl'});


// render
app.pages.get('a.tmpl')
  .render(function (err, res) {
    if (err) return console.log(err);
    console.log(res);
  });
