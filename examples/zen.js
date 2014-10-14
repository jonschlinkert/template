'use strict';

/**
 * Module dependencies
 */

var emmet = require('emmet');
var inspect = require('util').inspect;
var Template = require('..');
var template = new Template();
var debug = require('debug')('template');
var matter = require('gray-matter');
var utils = require('parser-utils');
var pretty = require('./pretty');
var _ = require('lodash');


template.engine('md', require('engine-handlebars'));
template.engine('tmpl', require('engine-lodash'));
template.create('snippet', 'snippets', { isPartial: true , engine: 'tmpl' });
template.addHelper('zen', function (value) {
  return emmet.expandAbbreviation(value);
});

template.data({title: 'Site!', section: 'foo'});

template.create('file', 'files', {
  isRenderable: true,
  loadFn: function (vinyl) {
    var file = _.merge({}, vinyl);
    Object.defineProperty(file, 'content', {
      enumerable: true,
      get: function () {
        return vinyl.contents.toString();
      },
      set: function (value) {
        vinyl.contents = new Buffer(value);
      }
    });
    return file;
  }
});

template.create('post', 'posts', { isRenderable: true });

template.post('home.md', 'this is content.', {layout: 'base.md'});
template.page('home.md', 'this is content.', {layout: 'base.md'});

template.page('about.md','{{name}}', {name: 'Jon Schlinkert', layout: 'default.md'});
template.partial('navbar.md', '<nav><ul><li>link</li></ul></nav>', {pretty: true});
template.partial('sidebar.md', '<section>Sidebar</section>\n');
// template.snippet('sidebar', '<%= zen("ul>li*5>a[href=$]{Item $}") %>');
template.snippet('link', '<link rel="stylesheet" href="bootstrap.css">\n');


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
  '    {{{snippet "link"}}}',
  '  </head>',
  '  <body>',
  '    {% body %}',
  '  </body>',
  '</html>'
].join('\n'), {title: 'Default'});


// var pages = template.get('pages');
// var pages = template.getType('renderable');
// console.log(pages);


// template.render('about.md', function (err, content) {
//   if (err) console.log(err);
//   console.log(content);
// });

template.render('home.md', function (err, content) {
  if (err) console.log(err);
  content = pretty(content);
  console.log(content);
});

// console.log(inspect(template, null, 10));