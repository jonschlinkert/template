'use strict';

var extend = require('extend-shallow');
var matter = require('parser-front-matter');
var App = require('..');
var app = new App();

app.onLoad(/\.html$/, function (view, next) {
  matter.parse(view, next);
});

/**
 * Define a template engine for rendering templates
 * in `.html` files
 */
app.engine('html', require('engine-lodash'));




/**
 * Custom view collections
 */
app.create('page');
app.create('include', { viewType: 'partial' });


/**
 * Register a custom async helper for getting includes
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
 * Load 'include' and 'page' templates
 */
app.include('button.html', { content: '---\ntext: me!\n---\n<%= text %>' });

// this template uses the `include` helper
app.page('home.html', { content: 'Click <%= include("button.html", {text: "something"}) %>' });



/**
 * Render the page
 */
app.render('home.html', function (err, res) {
  if (err) return console.error(err);

  console.log(res.content);
  //=> Click me!
});

