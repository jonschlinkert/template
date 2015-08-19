'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('globby');
var File = require('vinyl');
var App = require('..');
var app = new App();

/**
 * sync
 */

// sync loaders
app.loader('glob', function(views, options) {
  return glob.sync.bind(glob);
});

app.loader('read', function (views, options) {
  return function(files) {
    return files.reduce(function (acc, fp) {
      var str = fs.readFileSync(fp, 'utf8');
      var name = path.basename(fp);
      acc[name] = {path: fp, content: str};
      return acc;
    }, views);
  };
});

// create a view collection
app.create('post', { viewType: 'partial' }, ['glob', 'read']);

// define sync collection plugins
function one(opts) {
  return function(views) {
    // console.log('one:', views)
    return views;
  }
}

function two(opts) {
  return function(views) {
    // console.log('two:', views)
    return views;
  }
}

app.posts('test/fixtures/*.txt')
  .use(one())
  .use(two())
  .filter(function (value, key, views) {
    value.path = path.resolve(value.path);
  })

console.log(app.views.posts);
