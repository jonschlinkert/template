'use strict';

/**
 * Module dependencies
 */

var inspect = require('util').inspect;
var Template = require('..');
var template = new Template();
var pretty = require('./pretty');


template.engine('md', require('engine-handlebars'));

template.route(/\.md/, function (value, key, next) {
  // {path: 'a/b/c.md', content: 'this is content', locals: {}, options: {}}
  // foo

  console.log(arguments)
  next(null, value, key);
});

template.page('about.md','{{name}}', {name: 'Jon Schlinkert', layout: 'base.md'});
template.partial('navbar.md', '<nav><ul><li>link</li></ul></nav>');
template.data({title: 'Site!', section: 'Section Title'});

// template.route(
//   function (value, key, orig) {
//     if (key === 'content') {

//     }
//   },
//   function (params, next) {
//   next();
// });

template.create('post', {isRenderable: true },
  function(value, key, next) {
    next(null, value, key)
  },
  function(value, key) {
    next(null, value, key)
  });

template.create('doc', {isLayout: true }, [
  function(value, key) {
    next(null, value, key)
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