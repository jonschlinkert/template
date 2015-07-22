'use strict';

var path = require('path');
var matter = require('parser-front-matter');
var extend = require('extend-shallow');
var write = require('write');
var App = require('../..');
var app = new App();

function renameKey (fp) {
  return path.basename(fp, path.extname(fp));
}

/**
 * Define a template engine for rendering templates
 * in `.hbs` files
 */

app.engine('hbs', require('engine-handlebars'));
app.engine('md', require('engine-handlebars'));
app.data({title: 'My Blog!!!', site: {name: 'Foooo'}});

/**
 * Need to get the frontmatter from the contents.
 */

app.preLayout(/\.(hbs|md)$/, function (view, next) {
  view.layout = view.layout || view.locals.layout || view.data.layout;
  next();
});

app.onLoad(/\.(hbs|md)$/, function (view, next) {
  matter.parse(view, next);
});

app.onLoad(/_posts\/.*\.md$/, function (view, next) {
  var data = parseDate(view.data.date || path.basename(view.path));
  if (!data) return next();

  view.data = view.data || {};
  view.data.date = data.date;
  view.data.year = data.year;
  view.data.month = data.month;
  view.data.day = data.day;
  next();
});

function parseDate(str, strict) {
  // var re = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/;
  // if (strict) re = /^(\d{4})-(\d{2})-(\d{2})/;
  var re = /^(\d{4})-(\d{2})-(\d{2})/;

  var match = re.exec(str);
  if (!match) return null;

  var data = {};
  data.date = match[0];
  data.year = match[1];
  data.month = match[2];
  data.day = match[3];
  return data;
}


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
    if (err) return cb(err)
    cb(null, res.content);
  });
});

app.helper('date_to_string', function () {
  return ''
});

// app.helper('markdown', require('helper-markdown'));
app.helper('unless', function (a, b) {
  return !!a ? a : b;
});

app.helper('relative', function (a, b) {
  return path.relative(a, b);
});

app.helper('extend', function (a, b) {
  return extend(a, b);
});

app.helper('is', function () {
  return ''
});

app.helper('pager', function () {
  return ''
});

app.helper('_log', function (msg) {
  // console.log(msg);
  return '';
});

/**
 * Create custom template types
 */

app.create('page');
app.create('post', { permalinks: { structure: ':key.html'} });
app.create('include', { viewType: 'partial', renameKey: renameKey });
app.create('layout', { viewType: 'layout', renameKey: renameKey });


/**
 * Create additional custom template type for index list pages.
 * Use custom loaders to generate index pages.
 * These are used just like pages, but provide the layout for a list of pages.
 */

app.create('list', {
  permalinks: { structure: ':year/:month/:day/:num.html'},
  renameKey: renameKey
});

/**
 * Views
 */

app.pages('src/*.hbs');
app.posts('src/_posts/*.md');
app.layouts('src/_layouts/*.hbs');
app.includes('src/_includes/*.hbs');

/**
 * Load index pages for `posts`
 */

app.lists('archives.hbs', {
  cwd: 'src/_lists',
  content: [
    '<div class="pagination">',
    '  <h1>{{pagination.collection}}</h1>',
    '  <h2>{{slug}}</h2>',
    '',
    '    {{_log pagination}}',
    '  {{#each pagination.items}}',
    '    <h3>{{data.title}}</h3>',
    '  {{/each}}',
    '</div>',
  ].join('\n')
});

app.lists('tags.hbs', {
  cwd: 'src/_lists',
  content: [
    '<div class="pagination">',
    '  <h1>{{pagination.collection}}</h1>',
    '  <h2>{{slug}}</h2>',
    '',
    '  {{#each pagination.items}}',
    '    <h3>{{data.title}}</h3>',
    '  {{/each}}',
    '</div>',
  ].join('\n')
});

app.lists('categories.hbs', {
  cwd: 'src/_lists',
  content: [
    '<div class="pagination">',
    '  <h1>{{pagination.collection}}</h1>',
    '  <h2>{{slug}}</h2>',
    '',
    '  {{#each pagination.items}}',
    '    <h3>{{data.title}}</h3>',
    '  {{/each}}',
    '</div>',
  ].join('\n')
});


/**
 * Render
 */

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
var tagsList = app.lists.get('tags');
var categoriesList = app.lists.get('categories');

var groupStructures = [
  ':year/:num/index.html',
  ':year/:month/:num/index.html',
  ':year/:month/:day/:num/index.html'
];

var dateRe = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/;

/**
 * Generate navtree
 */

function navTree (collection, prop) {
  var list = app[collection].list(prop);

  var tree = {};
  list.groupBy(prop, function (categories) {

    if (typeof categories === 'object') {
      return Object.keys(categories);
    }
  }, function (err, categoryGroups) {
    var keys = Object.keys(categoryGroups);

    keys.forEach(function (category) {
      tree[category] = {
        permalink: categoriesList.permalink('/categories/:category.html', {
          category: category
        })
      };

      var group = categoryGroups[category];
      group.groupBy(prop, function (categories) {
        return categories[category];
      }, function (err, tags) {
        tree[category].tags = {};
        Object.keys(tags).forEach(function (key) {
          tree[category].tags[key] = {
            permalink: tagsList.permalink('/tags/:tag.html', {
              tag: key
            })
          };
        });
      });
    });
  });
  return tree;
}


/**
 * Data
 */

app.data({sidenav: navTree('posts', 'categories'), dest: {base: 'blog'} });


/**
 * Generate posts
 */

app.posts.forOwn(function (post, key) {
  var basename = path.basename(key, path.extname(key));
  // remove date from basename
  var permalink = post.permalink({key: basename.slice(11)});

  post.render({permalink: permalink}, function (err, res) {
    if (err) return console.error(err);
    writeDest(res, '_site/blog', permalink);
  });
});


app.posts.list('date')
  .groupBy('data.date', getDateGroup, function (err, groups) {
    console.log(groups)
    var keys = Object.keys(groups);
    keys.reverse();
    keys.forEach(function (key) {
      var group = groups[key];
      var m = dateRe.exec(key) || [];
      var data = {
        year: m[1],
        month: m[2],
        day: m[3]
      };

      var structure = groupStructures[key.split('-').length - 1];
      // console.log('==== ' + key + ' (' + structure + ') ====');
      group.paginate(list, {limit: 2}, function (err, pages) {
        pages.forEach(function (page) {
          console.log(group);
          data = extend({}, page.data.pagination, data);
          var permalink = page.permalink(structure, data);
          page.render({slug: key, permalink: permalink}, function (err, res) {
            if (err) return console.error(err);
            writeDest(res, '_site/blog/archives', permalink);
          });
        });
      });
    });
  });

function writeDest(file, destBase, permalink) {
  var dest = path.join(destBase, permalink);
  // console.log('writing:', dest);
  // write.sync(dest, file.content);
}
