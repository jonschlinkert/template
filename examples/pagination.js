'use strict';

var path = require('path');
var App = require('..');
var app = new App();
var _ = require('lodash');
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
  locals = _.extend({}, locals, view.data);
  view.render(locals, function (err, res) {
    cb(err, res.content);
  });
});


/**
 * Define a `page` that uses our new `include` helper
 */

app.page('home.hbs', {
  content: 'BEFORE\n{{ include "button.hbs"  btn }}\nAFTER',
  title: 'home',
  permalink: ':collection/home.html'
});
app.page('about.hbs', {
  content: 'BEFORE\n{{ include "button.hbs"  btn }}\nAFTER',
  title: 'about'
});
app.page('page1.hbs', {
  content: 'BEFORE\n{{ include "button.hbs"  btn }}\nAFTER',
  title: 'page1'
});
app.page('page2.hbs', {
  content: 'BEFORE\n{{ include "button.hbs"  btn }}\nAFTER',
  title: 'page2'
});
app.page('page3.hbs', {
  content: 'BEFORE\n{{ include "button.hbs"  btn }}\nAFTER',
  title: 'page3'
});

/**
 * Load index pages for `pages`
 */

app.lists('my-awesome-list-page.hbs', {
  content: 'BEFORE\n{{#each pagination.items}}{{locals.title}}\n{{/each}}\nAFTER',
  locals: {
    limit: 2,
    permalinks: {
      structure: ':collection/:num.html'
    }
  }
});

/**
 * Render
 */
// var page = app.pages.get('home.hbs');
// app.pages.option('permalinks', {

// });
// console.log(page.permalink());

var list = app.lists.get('my-awesome-list-page');
app.option({ permalinks: { structure: 'blog/:collection/:num.html' }});

app.pages
  .sortBy('locals.title')
  .paginate(list,function (err, views) {
    console.log(views)
    views.forEach(function (view) {
      view.render(function (err, view) {
        if (err) return console.error(err);
        console.log('==== INDEX ====');
        console.log(view.permalink(view.data.pagination));
        console.log(view.content);
        console.log('===============');
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

