'use strict';

/**
 * Module dependencies
 */

var inspect = require('util').inspect;
var Template = require('..');
var template = new Template();
var pretty = require('./pretty');


template.engine('md', require('engine-handlebars'));

template.page('about.md','{{name}}', {name: 'Jon Schlinkert', layout: 'base.md'});
template.partial('navbar.md', '<nav><ul><li>link</li></ul></nav>');
template.data({title: 'Site!', section: 'Section Title'});


template.route(/\.md/, function (params, next) {
  next();
});

template.create('foo', {isRenderable: true },
  function(foo, bar) {
    return foo;
  },
  function(foo, bar) {
    return foo;
  });

template.create('bar', {isLayout: true }, [
  function (foo, bar) {
    return foo;
  }
]);


// template.create('partial', 'partials');

template.layout('base.md', [
  '---',
  'layout: default.md',
  '---',
  '<h3>{{section}}</h3>',
  '<div>{{> navbar.md }}</div>',
  '<section>{% body %}</section>'
].join('\n'), {section: 'Foo'});


template.layout('default.md', [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '  <head>',
  '    <meta charset="UTF-8">',
  '    <title>{{title}}</title>',
  '  </head>',
  '  <body>',
  '    {% body %}',
  '  </body>',
  '</html>'
].join('\n'), {title: 'Default'});


template.render('about.md', function (err, content) {
  if (err) console.log(err);
  content = pretty(content);
  // console.log(content);
});

// console.log(inspect(template, null, 10));