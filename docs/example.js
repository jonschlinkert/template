'use strict';

var Template = require('..');
var template = new Template();
var consolidate = require('consolidate');
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');


template.engine('hbs', consolidate.handlebars);

var engine = template.getEngine('hbs').helpers;

engine.addHelper('include', function (filepath) {
  return fs.readFileSync(filepath, 'utf8');
});

engine.addMixin('include', function (filepath) {
  return fs.readFileSync(filepath, 'utf8');
});


template.page('home.hbs', 'this is content.');
template.partial('sidebar.hbs', '<section>Sidebar</section>');
template.partial('navbar.hbs', '<nav><ul><li>link</li></ul></nav>');

template.layout('default.hbs', [
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
].join('\n'));


var file = {path: 'about.hbs', content: '{{name}}', name: 'Jon Schlinkert'};
template.render(file, function (err, content) {
  if (err) console.log(err);
  console.log(content);
});

  // var inspect = require('util').inspect;
  // console.log(inspect(template, null, 10));