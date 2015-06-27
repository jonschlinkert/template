'use strict';

var extend = require('extend-shallow');
var matter = require('parser-front-matter');
var App = require('..');
var app = new App();

app.onLoad(/\.html$/, function (view, next) {
  matter.parse(view, next);
});

/**
 * Template engine for rendering '.html' templates.
 * Any consolidate engine will work.
 */
app.engine('html', require('engine-lodash'));


/**
 * Custom view collections
 */
app.create('page', { viewType: 'renderable' });
app.create('include', { viewType: 'partial' });
app.create('layout', { viewType: 'layout' });


/**
 * Load templates
 */
app.include('button.html', {content: '---\ntext: Click me!\n---\n<%= text %>'});
app.include('sidebar.html', {content: '---\ntext: Expand me!\n---\n<%= text %>'});


/**
 * Register a custom async template helper for adding includes
 */
app.asyncHelper('include', function (name, locals, cb) {
  var view = app.includes.get(name);
  locals = extend({}, locals, view.data);

  view.render(locals, function (err, res) {
    if (err) return cb(err);

    // return `content`, not `res`
    cb(null, res.content);
  });
});


/**
 * Define a `page` that uses our new `include` helper
 */
app.page('home.html', {content: '<%= include("button.html", {text: "Click something"}) %>'});


/**
 * Render
 */
var page = app.pages.get('home.html');
app.render(page, function (err, view) {
  if (err) return console.error(err);

  console.log(view);
});

