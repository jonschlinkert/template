'use strict';

var App = require('./');
var app = new App();
var _ = require('lodash');

/**
 * Define a template engine for rendering templates
 * in `.html` files
 */
app.engine('html', require('engine-lodash'), {
  delims: ['<%', '%>']
});


/**
 * Create custom template types
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
  locals = _.extend({}, locals, view.data);
  view.render(locals, cb);
});


/**
 * Define a `page` that uses our new `include` helper
 */
app.page('home.html', {content: '<%= include("button.html", {text: "Click something"}) %>'});


/**
 * Render
 */
app.render('home.html', function (err, content) {
  if (err) return console.error(err);
  console.log(content);
});

