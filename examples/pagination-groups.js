'use strict';

var path = require('path');
var App = require('..');
var app = new App();
var extend = require('extend-shallow');
var matter = require('parser-front-matter');

/**
 * Define a template engine for rendering templates
 * in `.hbs` files
 */

app.engine('hbs', require('engine-handlebars'));

/**
 * Need to get the frontmatter from the contents.
 */

app.onLoad(/\.hbs$/, function (view, next) {
  matter.parse(view, next);
});

/**
 * Create custom template types
 */

app.create('page', { viewType: 'renderable' });
app.create('post', { viewType: 'renderable', permalinks: { structure: ':year/:month/:day/:key.html'} });
app.create('include', { viewType: 'partial' });
app.create('layout', { viewType: 'layout' });

/**
 * Create additional custom template type for index list pages.
 * Use custom loaders to generate index pages.
 * These are used just like pages, but provide the layout for a list of pages.
 */

app.create('list', {
  viewType: 'renderable',
  renameKey: function (fp) {
    return path.basename(fp, path.extname(fp));
  }
});


/**
 * Load templates
 */

app.include('button.hbs', {content: '---\ntext: Click me!\n---\n{{ text }}'});
app.include('sidebar.hbs', {content: '---\ntext: Expand me!\n---\n{{ text }}'});

/**
 * Register a custom async template helper for adding includes
 */

app.asyncHelper('include', function (name, locals, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = locals;
    locals = {};
  }
  var view = app.includes.get(name);
  locals = extend({}, locals, view.data);
  view.render(locals, function (err, res) {
    cb(err, res.content);
  });
});


/**
 * Define a `page` that uses our new `include` helper
 */

app.page('home.hbs', {content: 'BEFORE\n{{ include "button.hbs"  btn }}\nAFTER', title: 'home'}, { permalink: ':collection/home.html' });
app.page('about.hbs', {content: 'BEFORE\n{{ include "button.hbs"  btn }}\nAFTER', title: 'about'});

/**
 * Define some `posts`
 */

app.post('first.md', {content: '## First Post\n\n> This is the first post {{date}}\n'}, {title: 'first', date: '2014-01-21'});
app.post('second.md', {content: '## Second Post\n\n> This is the second post {{date}}\n'}, {title: 'second', date: '2014-10-21'});
app.post('third.md', {content: '## Third Post\n\n> This is the third post {{date}}\n'}, {title: 'third', date: '2014-10-25'});
app.post('fourth.md', {content: '## Fourth Post\n\n> This is the fourth post {{date}}\n'}, {title: 'fourth', date: '2015-01-21'});
app.post('fifth.md', {content: '## Fifth Post\n\n> This is the fifth post {{date}}\n'}, {title: 'fifth', date: '2015-01-21'});
app.post('sixth.md', {content: '## Sixth Post\n\n> This is the sixth post {{date}}\n'}, {title: 'sixth', date: '2015-01-21'});
app.post('seventh.md', {content: '## Seventh Post\n\n> This is the seventh post {{date}}\n'}, {title: 'seventh', date: '2015-05-05'});
app.post('eighth.md', {content: '## Eight Post\n\n> This is the eighth post {{date}}\n'}, {title: 'eighth', date: '2015-06-12'});
app.post('ninth.md', {content: '## Ninth Post\n\n> This is the ninth post {{date}}\n'}, {title: 'ninth', date: '2015-06-12'});
app.post('tenth.md', {content: '## Tenth Post\n\n> This is the tenth post {{date}}\n'}, {title: 'tenth', date: '2015-06-12'});

/**
 * Load index pages for `posts`
 */

app.lists('archives.hbs', {
  content: '<h1>{{pagination.collection}}</h1>\n<h2>{{slug}}</h2>\n\n{{#each pagination.items}}{{locals.title}}\n{{/each}}'
});

/**
 * Render
 */
// var page = app.pages.get('home.hbs');
// app.pages.option('permalinks', {

// });
// console.log(page.permalink());

function getDateGroup (date) {
  var d = new Date(date);
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var groups = [];
  groups.push('' + year);
  groups.push('' + year + '-' + (month < 10 ? '0' : '') + month);
  groups.push('' + year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day);
  return groups;
}

var list = app.lists.get('archives');

app.posts
  .groupBy('locals.date', getDateGroup, function (err, groups) {
    var keys = Object.keys(groups);
    keys.forEach(function (key) {
      var group = groups[key];
      console.log('==== ' + key + ' ====');
      group.paginate(list, {limit: 2}, function (err, pages) {
        pages.forEach(function (page) {
          page.list.forEach(function (item) {
            item.excerpt();
          });
          page.render({slug: key}, function (err, res) {
            if (err) return console.error(err);
            console.log(res.permalink(res.data.pagination));
            console.log(res.content);
            console.log();
          });
        });
        console.log('=====================');
        console.log();
      });
    });
  });


// assemble.create('list');
// assemble.lists('src/templates/lists/*.hbs');
// var postList = assemble.lists.get('post-list');

// assemble.create('post');
// assemble.posts('/src/templates/posts/*.md');

// assemble.posts.sortBy('data.title')
//   .paginate(postList, { limit: 5 })
//   .pipe(assemble.render())
//   .pipe(assemble.permalinks())
//   .pipe(assemble.dest('/blog'));

