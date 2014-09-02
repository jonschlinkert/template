'use strict';

var Template = require('..');
var template = new Template();
var consolidate = require('consolidate');
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');


template.engine('hbs', consolidate.handlebars);

var engine = template.helpers('hbs');
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

template.page('home.hbs', 'this is content.');
template.page('about.hbs','{{name}}', {name: 'Jon Schlinkert', layout: 'default.hbs'});
template.partial('sidebar.hbs', '<section>Sidebar</section>\n');
template.partial('navbar.hbs', '<nav><ul><li>link</li></ul></nav>');

template.layout('default.hbs', [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '  <head>',
  '    <meta charset="UTF-8">',
  '    <title>{{title}}</title>',
  '  </head>',
  '  <body>',
  '    {{> sidebar.hbs }}',
  '    {{partial "home.hbs"}}',
  // '    {{foo this}}',
  // '    {{bar this}}',
  '    {% body %}',
  '  </body>',
  '</html>'
].join('\n'));


// var file = {path: 'about.hbs', content: '{{name}}', name: 'Jon Schlinkert', layout: 'default.hbs'};
// template.render(file, function (err, content) {
//   if (err) console.log(err);
//   console.log(content);
// });

template.render('about.hbs', function (err, content) {
  if (err) console.log(err);
  console.log(content);
});

  // console.log(template);


// var inspect = require('util').inspect;
// console.log(inspect(template, null, 10));