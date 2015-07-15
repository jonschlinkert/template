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
  var re = /^(\d{4})-(\d{2})-(\d{2})/;
  var m = re.exec(view.data.date || path.basename(view.path));
  if (!m) return next();

  view.data.date = m[0];
  view.data.year = m[1];
  view.data.month = m[2];
  view.data.day = m[3];
  next();
});

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

app.helper('date_to_string', function () {
  return ''
});

app.helper('is', function () {
  return ''
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

// console.log(Object.keys(app.views.includes));
// process.exit();

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

function navTree (collection, prop) {
  var tree = {};
  prop = ['data', prop].join('.');
  app[collection]
    .groupBy(prop, function (categories) {
      if (typeof categories === 'object') {
        return Object.keys(categories);
      }
    }, function (err, categoryGroups) {
      var keys = Object.keys(categoryGroups);
      keys.forEach(function (category) {
        tree[category] = {
          permalink: categoriesList.permalink('/categories/:category.html', {category: category})
        };
        var group = categoryGroups[category];

        group.groupBy(prop, function (categories) {
          return categories[category];
        }, function (err, tags) {
          tree[category].tags = {};
          Object.keys(tags).forEach(function (key) {
            tree[category].tags[key] = {
              permalink: tagsList.permalink('tags/:tag.html', {tag: key})
            };
          });
          // console.log(category, Object.keys(tags));
          // console.log();
          // console.log(tags);
        });
      });
    });
  return tree;
}

var tree = navTree('posts', 'categories');
console.log(JSON.stringify(tree, null, 2));


// app.posts.forOwn(function (post, key) {
//   var base = path.basename(key, path.extname(key));
//   var name = base.slice(11);
//   var permalink = post.permalink({key: name});
//   post.render({permalink: permalink}, function (err, res) {
//     if (err) return console.error(err);
//     writeDest(res, '_site/blog', permalink);
//   });
// });

// app.posts
//   .groupBy('data.date', getDateGroup, function (err, groups) {
//     var keys = Object.keys(groups);
//     keys.reverse();
//     keys.forEach(function (key) {
//       var group = groups[key];
//       var m = dateRe.exec(key);
//       var data = {
//         year: m[1],
//         month: m[2],
//         day: m[3]
//       };
//       var structure = groupStructures[key.split('-').length - 1];
//       console.log('==== ' + key + ' (' + structure + ') ====');
//       group.paginate(list, {limit: 2}, function (err, pages) {
//         pages.forEach(function (page) {
//           // console.log(group);
//           var permalink = page.permalink(structure, extend({}, page.data.pagination, data));
//           page.render({slug: key, permalink: permalink}, function (err, res) {
//             if (err) return console.error(err);
//             // console.log(res);
//             writeDest(res, '_site/blog/archives', permalink);
//           });
//         });
//         console.log('=====================');
//         console.log();
//       });
//     });
//   });

function writeDest(file, destBase, permalink) {
  console.log('writing...');
  var dest = path.join(destBase, permalink);
  write.sync(dest, file.content);
}

// function writeDest(file, srcBase, destBase) {
//   var re = new RegExp('^' + srcBase);
//   var base = file.path.replace(re, '');
//   var name = path.basename(base, path.extname(base));
//   var dir = path.dirname(base);

//   console.log('writing...');
//   var dest = path.join(destBase, dir, name + '.hbs');
//   write.sync(dest, file.content);
// }

// assemble.create('list');
// assemble.lists('src/templates/lists/*.hbs');
// var postList = assemble.lists.get('post-list');

// assemble.create('post');
// assemble.posts('/src/templates/posts/*.md');

// assemble.posts.sortBy('data.title')
//   .paginate(postList, { limit: 5 })
//   .pipe(assemble.permalinks())
//   .pipe(assemble.render())
//   .pipe(assemble.dest('/blog'));

