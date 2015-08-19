'use strict';

/* deps: mocha */
var extend = require('extend-shallow');
var matter = require('parser-front-matter');
var App = require('..');
var app = new App();

// engine
app.engine('md', require('engine-lodash'));
app.create('page');


// middleware for parsing front matter
app.onLoad(/\.md$/, function (view, next) {
  matter.parse(view, next);
});


// define a page
app.page('example.md', '<%= title %>');


// global (default) data
app.data({ title: 'app.cache.data'});

app.render('example.md', function (err, res) {
  if (err) return console.log(err);
  // console.log(res.contexts);
  console.log('app.cache.data:', res.content);
  //=> 'app.cache.data'
});



// pass data on the `.render` method
app.render('example.md', { title: 'render locals' }, function (err, res) {
  if (err) return console.log(err);
  // console.log(res.contexts);
  console.log('render locals:', res.content);
  //=> 'render locals: render locals
});



// pass data on `view.locals`
app.page('example.md', '<%= title %>', { title: 'view locals' });

app.render('example.md', function (err, res) {
  if (err) return console.log(err);
  // console.log(res.contexts);
  console.log('view locals:', res.content);
  //=> 'view locals: view locals'
});



// should prefer `view.locals` over `view.data` (front matter)
app.page('example.md', '---\ntitle: front matter\n---\n<%= title %>', { title: 'view locals' });

app.render('example.md', function (err, res) {
  if (err) return console.log(err);
  // console.log(res.contexts);
  console.log('view locals:', res.content);
  //=> 'view locals: view locals'
});



// should prefer `view.data` (front matter) over `view.locals`
// when `prefer locals` is disabled
app.pages.option('context', function contextFn(ctx, contexts, keys, fn) {
  fn(ctx, contexts, keys);
  ctx.title = contexts.matter.title;
  console.log(ctx)
  return ctx;
});

app.page('example.md', '---\ntitle: front matter\n---\n<%= title %>', { title: 'view locals' });

app.render('example.md', function (err, res) {
  if (err) return console.log(err);
  // console.log(res);
  console.log('front matter:', res.content);
  //=> 'front matter: front matter'
});



// should use a custom `context` function
// app.page('example.md', '<%= title %>', { title: 'view locals' });
// var res = {};

// var page = app.pages.get('example.md')
//   .context(function (ctx, contexts, keys, fn) {
//     fn(ctx, keys, contexts);
//     ctx.title = 'custom context method';
//     return ctx;
//   });


// app.render(page, function (err, res) {
//   if (err) return console.log(err);
//   // console.log(res.contexts);
//   console.log('custom context method:', res.content);
//   //=> 'custom context method: custom context method'
// });
