'use strict';

var Template = require('..');
var template = new Template();
var matter = require('gray-matter');
var utils = require('parser-utils');
var _ = require('lodash');


template.page('home.hbs', 'this is content.');
template.partial('sidebar.hbs', '<section>Sidebar</section>');
template.partial('navbar.hbs', '<nav><ul><li>link</li></ul></nav>');

template.layout('default', [
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