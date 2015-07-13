'use strict';

var path = require('path');
var matter = require('parser-front-matter');
var glob = require('glob-fs');
var App = require('..');
var app = new App();

/**
 * streams
 */

// parse front matter
app.onLoad(/\.md$/, function (view, next) {
  matter.parse(view, next);
});

// register an engine...
app.engine('md', require('engine-lodash'));

// create custom view-collections
app.create('post')
  .create('list', {
    renameKey: function (fp) {
      return path.basename(fp);
    }
  });

// define "global" data
app.data({ title: 'My Blog!' });

// load a template onto the `list` collection
app.list('index.md', {
  content: 'My Posts!\n{{#each pagination.items}}{{locals.title}}\n{{/each}}\n',
  locals: {
    limit: 2,
    permalinks: {structure: ':collection/:num.html'}
  }
});

var index = app.lists.get('index.md');
var opts = { permalink: 'blog/posts/:collection/:num.html' };
console.time('glob');

// glob some templates onto the `post` collection
glob({ gitignore: true })
  .readdirStream('test/fixtures/posts/**/*.md')
  .on('data', function (file) {
    app.posts(file.path, file);
  })
  .on('end', function () {
    app.posts
      .sortBy('data.title')
      .paginate(index, opts, function (err, posts) {
        posts.forEach(function (post) {
          post.render(function (err, post) {
            console.log(post.permalink(post.data.pagination));
          });
        });
        console.timeEnd('glob');
      });
  });
