'use strict';

var Template = require('..');
var template = new Template();
var debug = require('debug')('template');
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');

template.engine('md', require('engine-handlebars'));
var engine = template.helpers('md');

// template.helper('zen', function (snippet) {
//   return emmet.expand(snippet);
// });

template.data({
  title: 'Site!',
  section: ''
});

template.option('pretty', false);
template.option('rename', function (filepath) {
  return filepath;
});

// template.create('post', 'posts', {renderable: true});
// template.post('home.md', 'this is content.', {layout: 'base.md'});

template.page('home.md', 'this is content.', {layout: 'base.md'});
// template.page('about.md','{{name}}', {name: 'Jon Schlinkert', layout: 'default.md'});

template.partial('sidebar.md', '<section>Sidebar</section>\n');
template.partial('navbar.md', '<nav><ul><li>link</li></ul></nav>', {pretty: true});

// template.snippet('sidebar', 'ul>li*5>a[href=$]{Item $}');

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



// var file = {path: 'about.md', content: '{{name}}', name: 'Jon Schlinkert', layout: 'default.md'};
// template.render(file, function (err, content) {
//   if (err) console.log(err);
//   console.log(content);
// });

template.render('home.md', function (err, content) {
  if (err) console.log(err);
  console.log(content);
});

// console.log(template);


// var inspect = require('util').inspect;
// console.log(inspect(template, null, 10));