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

// custom view-collection: `post`
app.create('post');

// define "global" data
app.data({ title: 'My Blog!' });
app.option({excerpt: {link: '<blah>Foo</blah>'}})

console.time('glob');

// glob some templates onto the `post` collection
glob({ gitignore: true })
  .readdirStream('test/fixtures/posts/**/*.md')
  .on('data', function (file) {
    // console.log(file.path)
    app.posts(file.path, file);
  })
  .on('end', function () {
    app.posts.forOwn(function (post, key) {
      post.excerpt();

      console.log(post.content)
      post.render(function (err, post) {
        // console.timeEnd('glob');
      });
    });
  });
