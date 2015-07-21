'use strict';

var path = require('path');
var matter = require('parser-front-matter');
var glob = require('glob-fs');
var App = require('..');
var app = new App();

/**
 * engine
 */

app.engine('md', require('engine-lodash'));

/**
 * middleware
 */

// parse front matter
app.onLoad(/\.md$/, function (view, next) {
  matter.parse(view, next);
});

app.onLoad(/_posts\/.*\.md$/, function (view, next) {
  var re = /^((\d{4})-(\d{2})-(\d{2}))-?(.*)\.(\w+)$/;
  var m = re.exec(view.data.date || path.basename(view.path));
  if (!m) return next();

  view.data.date = m[1];
  view.data.year = m[2];
  view.data.month = m[3];
  view.data.day = m[4];
  view.data.postname = m[5];
  next();
});

/**
 * views
 */

// create custom view-collections
app.create('post')
  .create('list', {
    renameKey: function (fp) {
      return path.basename(fp);
    }
  });


/**
 * load
 */

// glob some templates onto the `post` collection
glob({ gitignore: true })
  .readdirStream('blog/src/**/*.md')
  .on('data', function (file) {
    app.posts(file.path, file);
  })
  .on('end', function () {
    app.posts.forOwn(function (view, key) {
      console.log();
      console.log(view.permalink('blog/post/:(postname|name).html', view.data));
      console.log(view.data)
    })
  });

