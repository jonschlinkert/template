'use strict';

var path = require('path');
var matter = require('parser-front-matter');
var App = require('..');
var app = new App();


/**
 * Need to get the frontmatter from the contents.
 */

app.onLoad(/\.hbs$/, function (view, next) {
  matter.parse(view, next);
});


/**
 * Define a template engine for rendering templates
 * in `.hbs` files
 */

app.engine('hbs', require('engine-handlebars'));
app.engine('md', require('engine-handlebars'));



app.helper('pager', function(locals, options, cb) {
  locals = extend({modifier: ''}, locals, options.hash);

  var template = [
    '<ul class="pager {{modifier}}">',
    '  {{#is pagination.currentPage 1}}',
    '    <li class="pager-heading">POPULAR</li>',
    '  {{/is}}',
    '  {{#isnt pagination.currentPage 1}}',
    '    <li class="previous"><a href="{{relative page.dest prev.dest}}">&larr; Previous</a></li>',
    '  {{/isnt}}',
    '  {{#isnt pagination.currentPage pagination.totalPages}}',
    '    <li class="next"><a href="{{relative page.dest next.dest}}">Next &rarr;</a></li>',
    '  {{/isnt}}',
    '  {{#is pagination.currentPage pagination.totalPages}}',
    '    <li class="next disabled"><a href="{{relative page.dest next.dest}}">Next &rarr;</a></li>',
    '  {{/is}}',
    '</ul>'
  ].join('\n');

  this.app.render(template, locals, function (err, res) {
    if (err) return cb(err);

    return cb(null, res.content);
  });
});

/**
 * Create custom template types
 */

app.create('page');
app.create('post', { permalinks: { structure: ':year/:month/:day/:key.html'} });
app.create('include', { viewType: 'partial' });
app.create('layout', { viewType: 'layout' });

/**
 * Create additional custom template type for index list pages.
 * Use custom loaders to generate index pages.
 * These are used just like pages, but provide the layout for a list of pages.
 */

app.create('list', {
  renameKey: function (fp) {
    return path.basename(fp);
  }
});

/**
 * Views
 */

app.pages('blog/src/*.hbs');
// app.posts('blog/src/_posts/*.md');
// app.layouts('blog/src/_layouts/*.hbs');
// app.includes('blog/src/_includes/*.hbs');

// console.log(app.views.includes)

// var list = app.posts.list('foo')
//   .pagination(function (err, post) {
//     // console.log(post)
//   })

console.log(app.views.posts)
