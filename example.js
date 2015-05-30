
var engine = require('engine-lodash');
var Template = require('./');
var template = new Template();
var _ = require('lodash');

template.engine('.html', engine, {delims: ['<%', '%>']});

/**
 * Create custom template types
 */

template.create('include');
template.create('block', {isLayout: true});

/**
 * Load templates
 */

template.include('button.html', {content: '---\ntext: Click me!\n---\n<%= text %>'});
template.include('sidebar.html', {content: '---\ntext: Expand me!\n---\n<%= text %>'});

/**
 * Create a custom (async) template helper
 * for adding includes to a template
 */

template.asyncHelper('include', function (name, locals, cb) {
  var file = template.getInclude(name);
  locals = _.extend({}, locals, file.data);

  file.render(locals, function (err, content) {
    if (err) return cb(err);
    // do stuff to post-rendered content
    cb(null, content);
  });
});

template.page('home.html', {
  content: '---\ntext: Click something else!\n---\n<%= include("button.html", {text: "Click something"}) %>'
});

template.render('home.html', function (err, content) {
  console.log(content)
});

