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

// glob some templates onto the `post` collection
glob({ gitignore: true })
  .readdirStream('test/fixtures/posts/**/*.md')
  .on('data', function (file) {
    app.posts(file.path, file);
  })
  .on('end', function () {
    app.posts.forOwn(function (view, key) {
      view.permalink();

      console.log(view.dest)
    })
  });

