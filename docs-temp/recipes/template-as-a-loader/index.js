'use strict';

var handlebars = require('engine-handlebars');
var fs = require('fs');
var Template = require('../..');
var template = new Template();

template.enable('debugEngine');
template.engine('.hbs', handlebars);

/**
 * Create a middleware to render markdown files
 * as handlebars first
 */

template.onLoad(/\.md/, function (file, next) {
  var engine = file.options._engine;
  file.options._engine = 'hbs';
  file.render(function (err, content) {
    file.content = content;
    file.options._engine = engine;
    next();
  });
});

/**
 * Add a new template type that is basically adding a
 * simple partial and generates built-in helpers
 */

template.create('apidoc', function (name, content) {
  var file = {};
  file[name] = {path: '', content: content, options: {}};
  return file;
});

/**
 * Create a `definedoc` helper to define api docs
 * inside handlebars templates
 */

template.asyncHelper('definedoc', function (name, options, next) {
  // call the function to "render" the content
  var content = options.fn(this && this.context);
  // add content as a partial
  template.apidoc(name, content, function (err) {
    next(err, '');
  });
});

/**
 * Render all the pages after they're loaded
 */

template.pages(__dirname + '/api-docs.md', function () {
  // now that this is loaded, we can use the partials in the markdown file
  var keys = Object.keys(template.views.pages);

  keys.forEach(function (key) {
    var page = template.views.pages[key];
    page.render(function (err, content) {
      fs.writeFileSync(__dirname + '/README.md', content);
    });
  });
});
