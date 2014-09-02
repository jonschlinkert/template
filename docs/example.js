'use strict';

var Template = require('..');
var template = new Template();
var consolidate = require('consolidate');
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');

template.engine('md', consolidate.handlebars);

var engine = template.helpers('md');
engine.addHelper('foo', function (value) {
  // console.log(this)
  // console.log(value);
});

template.addHelper('bar', function (value) {
  // console.log(this)
  // console.log(value);
});

template.data({
  title: 'Site!'
});

template.page('home.md', 'this is content.', {layout: 'base.md'});
template.page('about.md','{{name}}', {name: 'Jon Schlinkert', layout: 'default.md'});

template.partial('sidebar.md', '<section>Sidebar</section>\n');
template.partial('navbar.md', '<nav><ul><li>link</li></ul></nav>');

template.layout('base.md', [
  '---',
  'layout: default.md',
  '---',
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
].join('\n'), {title: 'Base'});

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