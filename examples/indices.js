'use strict';

var App = require('..');
var app = new App();
var _ = require('lodash');

/**
 * Define a template engine for rendering templates
 * in `.hbs` files
 */
app.engine('hbs', require('engine-assemble'));


/**
 * Create custom template types
 */
app.create('page', { viewType: 'renderable' });
app.create('include', { viewType: 'partial' });
app.create('layout', { viewType: 'layout' });

/**
 * Create additional custom template type for index list pages.
 * Use custom loaders to generate index pages.
 */
app.create('index', { viewType: 'renderable' }, ['paginate', 'load']);

/**
 * Create custom loaders to use with index template types
 */
app.loader('paginate', function (views, options) {
  function Page (collection, pageNum) {
    this.data = {};
    this.data.paginate = {};
    this.data.paginate.items = [];
    this.content = "{{paginate.collection}} Index {{paginate.pageNum}}";
    this.path = collection + '-index-' + pageNum;
  }

  /**
   * This needs to be extracted into another module and is
   * only an example. Ideally, many of this logic will
   * exist in methods on the `Views` object
   */
  return function (collection, opts) {
    opts = _.extend({
      limit: 10
    }, options, opts);
    var col = app.views[collection];
    var keys = Object.keys(col);
    var len = keys.length, i = 0, pageNum = 1;
    var total = Math.ceil(len / opts.limit);
    var pages = [], page = new Page(collection, pageNum);

    while (len--) {
      var item = col[i++];
      page.data.paginate.items.push(item);
      if (i % opts.limit === 0) {
        page.data.paginate = {
          collection: collection,
          page: pageNum++,
          limit: opts.limit
        };
        pages.push(page);
        page = new Page(collection, pageNum);
      }
    }
    if (i % opts.limit !== 0) {
      pages.push(page);
    }
    return pages;
  };
});

app.loader('load', function (views, options) {
  return function (pages) {
    return pages.reduce(function (acc, page) {
      acc.set(page.path, page);
      return acc;
    }, views);
  };
});


/**
 * Load templates
 */
app.include('button.hbs', {content: '---\ntext: Click me!\n---\n<%= text %>'});
app.include('sidebar.hbs', {content: '---\ntext: Expand me!\n---\n<%= text %>'});


/**
 * Register a custom async template helper for adding includes
 */
app.asyncHelper('include', function (name, locals, cb) {
  var view = app.includes.get(name);
  locals = _.extend({}, locals, view.data);
  view.render(locals, cb);
});


/**
 * Define a `page` that uses our new `include` helper
 */
app.page('home.hbs', {content: '{{ include "button.hbs"  btn }}'});
app.page('about.hbs', {content: '{{ include "button.hbs"  btn }}'});
app.page('page1.hbs', {content: '{{ include "button.hbs"  btn }}'});
app.page('page2.hbs', {content: '{{ include "button.hbs"  btn }}'});
app.page('page3.hbs', {content: '{{ include "button.hbs"  btn }}'});

/**
 * Load index pages for `pages`
 */
app.indices('pages', { limit: 2 });

console.log(app.views.indices);


// /**
//  * Render
//  */
// var page = app.pages.get('home.html');
// app.render(page, function (err, view) {
//   if (err) return console.error(err);
//   // console.log(view);
// });

